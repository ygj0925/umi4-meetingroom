import type { RequestConfig, RequestOptions } from '@umijs/max';
import { message, type NotificationArgsProps, notification } from 'antd';
import Notify from '@/utils/NotifyUtils';
import { isLogin, Token } from '@/utils/Web';

// 错误展示类型枚举（与后端约定）
export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 后端标准响应结构（严格类型约束）
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  errorCode?: number | string;
  errorMessage?: string;
  showType?: ErrorShowType;
  code?: number | string; // 兼容部分接口返回的code字段
  msg?: string; // 兼容部分接口返回的msg字段
}

// HTTP状态码提示信息映射
type StatusCode =
  | 200
  | 201
  | 202
  | 204
  | 400
  | 401
  | 403
  | 404
  | 408
  | 500
  | 501
  | 502
  | 503
  | 504;
const StatusCodeMessage: Record<StatusCode, string> = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)',
};

// 自定义业务错误类型
export class BizError extends Error {
  name: 'BizError' = 'BizError';
  info: Pick<ApiResponse, 'errorCode' | 'errorMessage' | 'showType' | 'data'>;

  constructor(
    message: string,
    info: Pick<ApiResponse, 'errorCode' | 'errorMessage' | 'showType' | 'data'>,
  ) {
    super(message);
    this.info = info;
    // 修复TypeScript继承Error的原型链问题
    Object.setPrototypeOf(this, BizError.prototype);
  }
}

// 错误提示工具函数类型
type ErrorShowFn = (msg: string, type?: 'message' | 'notification') => void;

/**
 * Umi Max 请求全局配置
 * 全TypeScript类型约束，无any类型
 */
export const requestConfig: RequestConfig = {
  timeout: 30 * 1000,

  // 错误处理配置
  errorConfig: {
    // 业务错误抛出器（将后端返回的错误转换为自定义BizError）
    errorThrower: (res: unknown) => {
      const responseData = res as ApiResponse;
      const { success, errorCode, errorMessage, showType, data } = responseData;

      if (!success) {
        throw new BizError(errorMessage || '业务请求失败', {
          errorCode,
          errorMessage,
          showType,
          data,
        });
      }
    },

    // 全局错误处理器
    errorHandler: (error) => {
      // 避免重复提示错误的标记
      const errorState = { hasShown: false };

      // 统一错误提示函数
      const showError: ErrorShowFn = (msg, type = 'message') => {
        if (errorState.hasShown) return;
        errorState.hasShown = true;

        if (type === 'message') {
          message.error(msg);
        } else {
          const notificationConfig: NotificationArgsProps = {
            message: '请求异常',
            description: msg,
            type: 'error',
          };
          notification.open(notificationConfig);
        }
      };

      // 处理自定义业务错误
      if (error instanceof BizError) {
        const { errorMessage, errorCode, showType } = error.info;
        const validMessage = errorMessage || '未知业务错误';

        switch (showType) {
          case ErrorShowType.SILENT:
            break;
          case ErrorShowType.WARN_MESSAGE:
            message.warning(validMessage);
            break;
          case ErrorShowType.ERROR_MESSAGE:
            showError(validMessage);
            break;
          case ErrorShowType.NOTIFICATION:
            notification.open({
              message: `错误码: ${errorCode ?? '未知'}`,
              description: validMessage,
              type: 'error',
            });
            break;
          case ErrorShowType.REDIRECT:
            // 401重定向登录逻辑
            if ([401, '401'].includes(errorCode as string | number)) {
              Notify.logout();
              showError('登录状态失效，请重新登录');
            }
            break;
          default:
            showError(validMessage);
        }
      }
      // 处理Axios网络错误（有响应但状态码非2xx）
      else if ('response' in error && error.response) {
        const { status, data } = error.response;
        const resData = data as ApiResponse;
        const statusNumber = status as StatusCode;

        // 优先使用后端返回的错误信息，其次使用状态码默认信息
        const errorMsg =
          resData.errorMessage ||
          resData.msg ||
          StatusCodeMessage[statusNumber] ||
          '服务器暂时未响应，请刷新页面并重试';

        // 401未授权处理
        if (status === 401) {
          Notify.logout();
          showError('登录状态失效，请重新登录');
        } else {
          showError(errorMsg);
        }
      }
      // 处理无响应的网络错误（如断网）
      else if ('request' in error) {
        showError('网络连接异常，无法连接到服务器，请检查网络后重试');
      }
      // 处理其他错误（如请求配置错误）
      else {
        showError('请求处理失败，请稍后重试', 'notification');
      }

      // 继续抛出错误，供业务层捕获
      return Promise.reject(error);
    },
  },

  // 请求拦截器（添加Token、拼接URL前缀）
  requestInterceptors: [
    (config: RequestOptions): RequestOptions => {
      const { url = '', headers = {} } = config;
      const prefix = (process.env.requestPrefix as string) || '/api';

      // 安全拼接URL，避免重复斜杠
      const cleanPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      const finalUrl = `${cleanPrefix}/${cleanUrl}`;

      // 类型安全的请求头处理
      const newHeaders: Record<string, string> = {};
      // 遍历原始headers，统一转换值为字符串
      Object.entries(headers).forEach(([key, value]) => {
        // 过滤掉undefined/null值（避免无效请求头）
        if (value === undefined || value === null) return;
        // 将数字/布尔值转为字符串（符合HTTP请求头规范）
        newHeaders[key] = String(value);
      });

      const token = Token.get() as string | null;

      // 添加Bearer Token
      if (!newHeaders.Authorization && token && isLogin()) {
        newHeaders.Authorization = `Bearer ${token}`;
      }

      return {
        ...config,
        url: finalUrl,
        headers: newHeaders,
      };
    },
  ],

  // 响应拦截器（处理Blob、401、业务错误）
  responseInterceptors: [
    // 响应成功拦截器
    async (response) => {
      const { data, request, config } = response;
      const { responseType } = request;

      // 处理Blob类型响应（文件下载场景）
      if (responseType === 'blob') {
        const blobData = data as Blob;

        // 判断Blob是否为JSON错误信息
        if (blobData.type.startsWith('application/json')) {
          try {
            // 异步读取Blob内容
            const blobText = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('读取Blob数据失败'));
              reader.readAsText(blobData);
            });

            const jsonData = JSON.parse(blobText) as ApiResponse;
            if (!jsonData.success) {
              const errorMsg =
                jsonData.msg || jsonData.errorMessage || '文件处理失败';
              message.error(errorMsg);
              return Promise.reject(new BizError(errorMsg, jsonData));
            }
          } catch (err) {
            const error = err as Error;
            message.error('解析响应数据失败: ' + error.message);
            return Promise.reject(error);
          }
        }

        // 正常文件Blob直接返回
        return response;
      }

      // 处理普通JSON响应
      const jsonResponse = data as ApiResponse;
      const { success, code, msg, errorCode, errorMessage } = jsonResponse;

      // 响应成功直接返回
      if (success) {
        return response;
      }

      // 401 Token失效处理（兼容code/errorCode）
      const authErrorCodes = [401, '401'];
      const currentCode = code ?? errorCode;
      if (
        authErrorCodes.includes(currentCode as string | number) &&
        config.url && // 修复：先判断url存在
        !config.url.includes('/auth/user/info')
      ) {
        Notify.logout();
        const errMsg = msg || errorMessage || '登录状态失效，请重新登录';
        return Promise.reject(new BizError(errMsg, jsonResponse));
      }

      // 其他业务错误抛出
      const errMsg = msg || errorMessage || '服务器端错误';
      return Promise.reject(new BizError(errMsg, jsonResponse));
    },

    // 响应错误拦截器
    (error) => {
      // 错误统一交由errorHandler处理，此处仅透传
      return Promise.reject(error);
    },
  ],
};
