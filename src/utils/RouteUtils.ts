import type { Route } from '@ant-design/pro-layout/lib/typing';
import React from 'react';
import { router } from '@/services/web/login';
import type { GLOBAL } from '@/typings';

export type ExpandRoute = {
  id?: number;
  redirect?: string;
  meta?: Record<string, any>;
  exact?: boolean;
  children?: ExpandRoute[];
  routes?: ExpandRoute[];
  component?: any;
} & Route;

let menuDict: Record<string, ExpandRoute> = {};
let cachedMenuRoutes: ExpandRoute[] = [];
let cachedFirstPath: string | undefined;

function getRedirectPath(menu: ExpandRoute): string {
  let redirectPath = menu.path;

  if (menu.children && menu.children.length > 0) {
    const cm = menu.children[0];
    if (!cm.exact) {
      return getRedirectPath(cm as ExpandRoute);
    }
    redirectPath = cm.path || redirectPath;
  }

  return redirectPath || '/';
}

function getFirstUrl(menuArray: ExpandRoute[]): string | undefined {
  for (const menu of menuArray) {
    if (!menu?.hideInMenu) {
      if (menu?.children && menu.children.length > 0 && menu.children[0].path) {
        const url = getFirstUrl(menu.children);
        if (url) return url;
      } else if (menu?.exact) {
        return menu.path;
      }
    }
  }
  return undefined;
}

export function serializationRemoteList(
  list: GLOBAL.Router[],
  pId: number,
  parentPath: string,
): ExpandRoute[] {
  const routes: ExpandRoute[] = [];

  list.forEach((val) => {
    if (val.parentId === pId) {
      const path = val.path.startsWith('/') ? val.path : `/${val.path}`;
      const route: ExpandRoute = {
        id: val.id,
        hideInMenu: Boolean(val.hidden),
        icon: val.icon,
        locale: false,
        path: `${parentPath}${path}`,
        name: val.title,
        exact: val.type === 1,
        meta: val,
      };

      if (val.type === 0) {
        const childrenArray = serializationRemoteList(list, val.id, route.path);
        route.routes = childrenArray;
        route.children = childrenArray;
        route.meta = { ...route.meta, redirectPath: getRedirectPath(route) };
      } else if (val.type === 1) {
        if (val.targetType === 1) {
          route.component = val.uri;
        } else if (val.targetType === 2) {
          route.component = '__inline__';
        } else {
          route.target = '_blank';
          route.path = val.uri;
        }
        menuDict[route.path] = route;
      }
      routes.push(route);
    }
  });

  return routes;
}

export async function fetchAndCacheRoutes(): Promise<void> {
  const res = await router();
  const list = res?.data ?? [];
  const arr = Array.isArray(list) ? list : [];
  menuDict = {};
  cachedMenuRoutes = serializationRemoteList(arr, 0, '');
  cachedFirstPath = getFirstUrl(cachedMenuRoutes);
}

function buildClientRoute(route: ExpandRoute): any {
  const result: any = { path: route.path, id: `dynamic-${route.id}` };

  if (route.exact && route.component) {
    let LazyComponent: React.LazyExoticComponent<any>;

    if (route.component === '__inline__') {
      LazyComponent = React.lazy(() => import('@/components/Inline'));
    } else {
      const uri = route.component;
      LazyComponent = React.lazy(() =>
        import(`@/pages/${uri}`).catch(() => import('@/pages/404')),
      );
    }

    result.element = React.createElement(
      React.Suspense,
      { fallback: React.createElement('div') },
      React.createElement(LazyComponent),
    );
  }

  if (route.children && route.children.length > 0) {
    result.children = route.children.map(buildClientRoute);
    result.children.push({
      path: '*',
      element: React.createElement(
        React.Suspense,
        { fallback: React.createElement('div') },
        React.createElement(React.lazy(() => import('@/pages/404'))),
      ),
    });
  }

  return result;
}

export function buildClientRoutes(menuRoutes: ExpandRoute[]): any[] {
  return menuRoutes.map(buildClientRoute);
}

export function getCachedMenuRoutes(): ExpandRoute[] {
  return cachedMenuRoutes;
}

export function getCachedFirstPath(): string | undefined {
  return cachedFirstPath;
}

export function redirect(arg: string) {
  const path = arg.startsWith('/') ? arg : `/${arg}`;
  window.location.href = `${path}?redirect=${window.location.pathname}`;
}

const RouteUtils = {
  getRedirectPath,
  redirect,
  getMenuDict: () => {
    return menuDict;
  },
};

export default RouteUtils;
