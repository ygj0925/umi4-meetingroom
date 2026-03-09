import {
  DashboardOutlined,
  FormOutlined,
  SmileOutlined,
  TableOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type {
  MenuDataItem,
  ProLayoutProps,
  Settings,
} from '@ant-design/pro-components';
import {
  ProLayout,
  SettingDrawer,
  WaterMark,
} from '@ant-design/pro-components';
import { css } from '@emotion/css';
import { history, Link, Outlet, useLocation, useModel } from '@umijs/max';
import { theme } from 'antd';
import React, { type FC, useEffect, useMemo } from 'react';
import defaultSettings from '@/../config/defaultSettings';
import routesConfig from '@/../config/routes';
import Footer from '@/components/Footer';
import { isLogin } from '@/utils/Web';

/**
 * icon 映射
 */

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  user: <UserOutlined />,
  table: <TableOutlined />,
  form: <FormOutlined />,
  smile: <SmileOutlined />,
  warning: <WarningOutlined />,
};

/**
 * 路由 -> 菜单转换
 */

function transformRoutes(routes: any[]): MenuDataItem[] {
  return routes
    .filter((r) => {
      if (r.layout === false) return false;
      if (r.hideInMenu) return false;
      if (!r.path) return false;
      return true;
    })
    .map((route) => {
      const item: MenuDataItem = {
        path: route.path,
        name: route.name,
      };

      if (route.icon && iconMap[route.icon]) {
        item.icon = iconMap[route.icon];
      }

      if (route.routes) {
        item.children = transformRoutes(route.routes);
      }

      return item;
    });
}

/**
 * BaseLayout Props
 */

export type BaseLayoutProps = {
  route: ProLayoutProps['route'] & {
    authority: string[];
    routes: any[];
  };

  settings: Settings;
  breadcrumbNameMap: Record<string, MenuDataItem>;
} & ProLayoutProps;

/**
 * BaseLayout
 */

const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const location = useLocation();

  const { initialState, setInitialState } = useModel('@@initialState');

  /**
   * 动态菜单 model
   */

  const { dynamicRoute, firstPath } = useModel('dynamicRoute');

  /**
   * 静态菜单
   */

  const staticMenus = useMemo(() => {
    return transformRoutes(routesConfig);
  }, []);

  /**
   * 合并菜单
   */

  const menuData = useMemo(() => {
    if (!dynamicRoute?.length) {
      return staticMenus;
    }

    return [...staticMenus, ...dynamicRoute];
  }, [dynamicRoute, staticMenus]);

  /**
   * 自动跳转首页
   */

  useEffect(() => {
    if (location.pathname === '/' && firstPath && firstPath !== '/') {
      history.replace(firstPath);
    }
  }, [location.pathname, firstPath]);

  /**
   * 路由变化
   */

  const handlePageChange = () => {
    if (!isLogin(initialState)) {
      history.push('/user/login');
    }
  };

  /**
   * Layout
   */

  return (
    <ProLayout
      title={defaultSettings.title}
      logo={defaultSettings.logo}
      location={location}
      /**
       * 菜单
       */

      route={{
        path: '/',
        routes: menuData,
      }}
      /**
       * mix = 顶部 + 左侧
       */

      layout="mix"
      /**
       * 顶部菜单
       */

      splitMenus
      /**
       * 页面变化
       */

      onPageChange={handlePageChange}
      /**
       * 菜单点击
       */

      menuItemRender={(item, dom) => {
        if (!item.path) return dom;

        return <Link to={item.path}>{dom}</Link>;
      }}
      /**
       * 顶部 actions
       */

      actionsRender={() => []}
      /**
       * 头像
       */

      avatarProps={{
        src: 'https://i.pravatar.cc/40',
        size: 'small',
        title: initialState?.user?.info?.username,
      }}
      /**
       * footer
       */

      footerRender={() => <Footer />}
      /**
       * 侧边栏
       */

      fixSiderbar
      fixedHeader
      siderWidth={220}
      /**
       * breadcrumb
       */

      breadcrumbRender={(routers) =>
        routers?.map((item) => ({
          path: item.path,
          breadcrumbName: item.breadcrumbName,
        }))
      }
      {...initialState?.settings}
    >
      <WaterMark
        content={initialState?.user?.info?.username}
        style={{ height: '100%' }}
      >
        <Outlet />
      </WaterMark>

      <SettingDrawer
        pathname={location.pathname}
        enableDarkTheme
        settings={initialState?.settings}
        onSettingChange={(settings) => {
          setInitialState({
            ...initialState,
            settings,
          });
        }}
      />
    </ProLayout>
  );
};

export default BaseLayout;
