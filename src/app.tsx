import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig } from '@umijs/max';
import type { GLOBAL } from '@/typings';
import { requestConfig } from '@/utils/RequestConfig';
import { LayoutSetting, User } from '@/utils/Web';
import settings from '../config/defaultSettings';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  user?: GLOBAL.UserInfo;
  loading?: boolean;
}> {
  const is: GLOBAL.Is = {
    settings: { ...settings, ...LayoutSetting.get() },
  };
  const cache = User.get();

  if (cache) {
    is.user = cache ? JSON.parse(cache) : {};
  }

  return { ...is };
}

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  ...requestConfig,
};
