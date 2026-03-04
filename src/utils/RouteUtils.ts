import type { GLOBAL } from '@/typings';
import type { Route } from '@ant-design/pro-layout/lib/typing';
import { useLocation, useNavigate } from '@umijs/max';

export type ExpandRoute = {
  id?: number;
  redirect?: string;
  meta?: Record<string, any>;
  exact?: boolean;
  children?: ExpandRoute[];
  routes?: ExpandRoute[];
} & Route;

let menuDict: Record<string, ExpandRoute> = {};


function getRedirectPath(menu: ExpandRoute): string {
  let redirectPath = menu.path;

  if (menu.children && menu.children.length > 0) {
    const cm = menu.children[0];
    // 非菜单页. 寻找下级
    if (!cm.exact) {
      return getRedirectPath(cm as ExpandRoute);
    }

    redirectPath = cm.path || redirectPath;
  }

  return redirectPath || '/';
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
      // @ts-ignore
      const route: BallcatMenuItem = {
        id: val.id,
        hideInMenu: Boolean(val.hidden),
        icon: val.icon,
        locale: false,
        path: `${parentPath}${path}`,
        name: val.title,
        // 只有菜单页要求全匹配
        exact: val.type === 1,
        meta: val,
      };

      // 目录处理
      if (val.type === 0) {
        const childrenArray = serializationRemoteList(list, val.id, route.path);

        route.routes = childrenArray;
        route.children = childrenArray;
        route.meta = { ...route.meta, redirectPath: getRedirectPath(route) };
      }
      // 菜单处理
      else if (val.type === 1) {
        let component: any;
        // 组件
        if (val.targetType === 1) {
          
        }
        // 内链
        else if (val.targetType === 2) {
         
        }
        // 外链
        else {
          route.target = '_blank';
          route.path = val.uri;
        }
        menuDict[route.path] = route;
        route.component = component;
      }
      routes.push(route);
    }
  });

  return routes;
}

//  重定向，并且将当前的 url 保存
export function redirect(arg: string) {
  const path = arg.startsWith('/') ? arg : `/${arg}`;
  const location = useLocation()
  const navigate = useNavigate();
  if (path !== location.pathname) {
    navigate(`${path}?redirect=${location.pathname}`)
  }
}

const RouteUtils = {
  getRedirectPath,
  redirect,
  getMenuDict: () => {
    return menuDict;
  },
};

export default RouteUtils;
