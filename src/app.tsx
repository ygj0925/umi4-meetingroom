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

let menuData: any[] = [];
const menuMatch = (data: any[]) => {
  const arr = data.map((item) => {
    if (item.children.length) {
      menuMatch(item.children);
    } else {
      item.element = (() => {
        item.component = require(`./pages/${item.uri}`).default;
        const PageComponent = item.component;
        return <PageComponent />;
      })();
    }
    return {
      name: item.name,
      element: item.element,
      component: item.component,
      children: item.children,
      path: item.path,
      icon: item.icon,
      parentId: item.parentId,
      id: item.id,
      uri: item.uri,
    };
  });

  return arr;
};

export async function pathClientRoutes({ routes }: { routes: any[] }) {
  const arr = menuMatch(menuData);
  routes[0].children.push(arr[0]);
}

export async function render(oldRender: () => void) {
  const res = await fetch('/api/getMenuList');
  const data = await res.json();
  menuData = data.data || [];
  oldRender();
}
