import { useCallback, useState, useEffect } from 'react';
import { useModel, useRequest } from '@umijs/max'
import { router } from '@/services/web/login';
import { isLogin } from '@/utils/Web';
import { serializationRemoteList } from '@/utils/RouteUtils';
import type { MenuDataItem } from '@ant-design/pro-components';
const getFirstUrl = (menuArray: any[]): string | undefined => {
  for (let index = 0; index < menuArray.length; index += 1) {
    const menu: any = menuArray[index];
    // 菜单未隐藏
    if (!menu?.hideInMenu) {
      // 如果存在子级 且子级的第一个菜单存在路径
      if (menu?.children && menu?.children.length > 0 && menu?.children[0].path) {
        const url = getFirstUrl(menu?.children);
        // 存在首页
        if (url) {
          return url;
        }
      }
      // 不存在, 且当前菜单是页面
      else if (menu?.exact) {
        return menu.path;
      }
    }
  }

  return undefined;
};



export default function dynamicRoute() {
  const { initialState } = useModel('@@initialState');
  const [dynamicRoute, setDynamicRoute] = useState<any[]>([]);
  const [firstPath, setMenuFirst] = useState<string>();
  const [load, setLoad] = useState(false);

  const { run } = useRequest(router, {
    manual: true,
    onSuccess: (res: any) => {
      const list = res?.data ?? res ?? [];
      const arr = Array.isArray(list) ? list : [];
      const routerArr = serializationRemoteList(arr, 0, '');
      setDynamicRoute(routerArr);
      setMenuFirst(getFirstUrl(routerArr));
    },
  });

  const getDynamicRoute = useCallback(() => {
    run();
  }, [run]);

  useEffect(() => {
    if (initialState && isLogin(initialState)) {
      getDynamicRoute();
    }
  }, [initialState, getDynamicRoute]);

  console.log(dynamicRoute, 'dynamicRoute')
  console.log(firstPath, 'firstPath')
  console.log(load, 'load')
  console.log(setLoad, 'setLoad')

  return { dynamicRoute, firstPath, getDynamicRoute, load, setLoad };
}
