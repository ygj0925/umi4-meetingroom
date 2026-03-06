import {
  CaretDownFilled,
  CheckCircleOutlined,
  DashboardOutlined,
  DoubleRightOutlined,
  FormOutlined,
  PlusCircleFilled,
  ProfileOutlined,
  SearchOutlined,
  SmileOutlined,
  TableOutlined,
  UserOutlined,
  InfoCircleFilled,
  QuestionCircleFilled,
  GithubFilled,
  WarningOutlined,
} from '@ant-design/icons';
import {
  ProLayout,
  SettingDrawer,
  WaterMark,
} from '@ant-design/pro-components';
import type {
    ProLayoutProps,
    MenuDataItem,
    Settings,
} from '@ant-design/pro-components';
import { css } from '@emotion/css';
import { useModel, history } from '@umijs/max';
import { Divider, Input, Popover, theme } from 'antd';
import type { FC } from 'react';
import React, { useMemo, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import Footer from '@/components/Footer/index';
import { AvatarDropdown } from '@/components';
import AppListRender from '@/components/AppListRender'
import Icon from '@/components/Icon';
import { LayoutSetting } from '@/utils/Web';
import defaultSettings from '../../config/defaultSettings';
import routesConfig from '../../config/routes';
import { createFromIconfontCN } from '@ant-design/icons';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
});

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  form: <FormOutlined />,
  table: <TableOutlined />,
  profile: <ProfileOutlined />,
  user: <UserOutlined />,
  smile: <SmileOutlined />,
  warning: <WarningOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
};

function transformRoutes(routes: any[]): any[] {
  return routes
    .filter(
      (r) =>
        r.layout !== false &&
        r.path !== '/user' &&
        !r.component?.includes('404') &&
        r.hideInMenu !== true,
    )
    .map((route) => {
      const { path, name, icon, routes: children } = route;
      const item: any = { path, name };
      if (icon && iconMap[icon]) {
        item.icon = iconMap[icon];
      }
      if (children?.length) {
        item.routes = transformRoutes(children);
      }
      return item;
    });
}

const Item: React.FC<{ children: React.ReactNode }> = (props) => {
  const { token } = theme.useToken();
  return (
    <div
      className={css`
        color: ${token.colorTextSecondary};
        font-size: 14px;
        cursor: pointer;
        line-height: 22px;
        margin-bottom: 8px;
        &:hover {
          color: ${token.colorPrimary};
        }
      `}
      style={{
        width: '33.33%',
      }}
    >
      {props.children}
      <DoubleRightOutlined
        style={{
          marginInlineStart: 4,
        }}
      />
    </div>
  );
};

const List: React.FC<{ title: string; style?: React.CSSProperties }> = (
  props,
) => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        width: '100%',
        ...props.style,
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: token.colorTextHeading,
          lineHeight: '24px',
          fontWeight: 500,
          marginBlockEnd: 16,
        }}
      >
        {props.title}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {new Array(6).fill(1).map((_, index) => {
          return <Item key={index.toString()}>具体的解决方案-{index}</Item>;
        })}
      </div>
    </div>
  );
};

const MenuCard = () => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Divider
        style={{
          height: '1.5em',
        }}
        type="vertical"
      />
      <Popover
        placement="bottom"
        overlayStyle={{
          width: 'min(calc(100vw - 24px), 1200px)',
          maxWidth: 'calc(100% - 24px)',
          padding: '24px',
          paddingTop: 8,
          height: '307px',
          borderRadius: '0 0 6px 6px',
        }}
        content={
          <div style={{ display: 'flex', padding: '32px 40px' }}>
            <div style={{ flex: 1 }}>
              <List title="金融解决方案" />
              <List
                title="其他解决方案"
                style={{
                  marginBlockStart: 32,
                }}
              />
            </div>

            <div
              style={{
                width: '308px',
                borderInlineStart: `1px·solid·${token.colorBorder}`,
                paddingInlineStart: 16,
              }}
            >
              <div
                className={css`
                  font-size: 14px;
                  color: ${token.colorText};
                  line-height: 22px;
                `}
              >
                热门产品
              </div>
              {new Array(3).fill(1).map((_name) => {
                return (
                  <div
                    key={uuidv4()}
                    className={css`
                      border-radius: 4px;
                      padding: 16px;
                      margin-top: 4px;
                      display: flex;
                      cursor: pointer;
                      &:hover {
                        background-color: ${token.colorBgTextHover};
                      }
                    `}
                  >
                    <img
                      src="https://gw.alipayobjects.com/zos/antfincdn/6FTGmLLmN/bianzu%25252013.svg"
                      alt={''}
                    />
                    <div
                      style={{
                        marginInlineStart: 14,
                      }}
                    >
                      <div
                        className={css`
                          font-size: 14px;
                          color: ${token.colorText};
                          line-height: 22px;
                        `}
                      >
                        Ant Design
                      </div>
                      <div
                        className={css`
                          font-size: 12px;
                          color: ${token.colorTextSecondary};
                          line-height: 20px;
                        `}
                      >
                        杭州市较知名的 UI 设计语言
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }
      >
        <div
          style={{
            color: token.colorTextHeading,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            gap: 4,
            paddingInlineStart: 8,
            paddingInlineEnd: 12,
            alignItems: 'center',
          }}
          className={css`
            &:hover {
              background-color: ${token.colorBgTextHover};
            }
          `}
        >
          <span> 企业级资产中心</span>
          <CaretDownFilled />
        </div>
      </Popover>
    </div>
  );
};

const SearchInput = () => {
  const { token } = theme.useToken();
  return (
    <div
      key="SearchOutlined"
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        color: token.colorPrimary,
        marginInlineEnd: 24,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Input
        style={{
          borderRadius: 4,
          marginInlineEnd: 12,
          backgroundColor: token.colorBgTextHover,
        }}
        prefix={
          <SearchOutlined
            style={{
              color: token.colorPrimary,
            }}
          />
        }
        placeholder="搜索方案"
        variant="borderless"
      />
      <PlusCircleFilled
        style={{
          color: token.colorPrimary,
          fontSize: 24,
        }}
      />
    </div>
  );
};

export type BaseLayoutProps = {
    breadcrumbNameMap: Record<string, MenuDataItem>;
    route: ProLayoutProps['route'] & {
        authority: string[];
        routes: any[];
    };
    settings: Settings;
} & ProLayoutProps;

const BaseLayouts: FC<BaseLayoutProps> = (props) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { dynamicRoute, firstPath, load, setLoad } = useModel('dynamicRoute');
  const location = useLocation();

  const routeConfig = useMemo(() => {
    const menuRoutes = transformRoutes(routesConfig);
    return { path: '/', routes: menuRoutes };
  }, []);


    useEffect(() => {
        if (load) {
            return;
        }
        const menuRoutes = transformRoutes(routesConfig);
        const newRoute = { ...menuRoutes };
      
        console.log(dynamicRoute, 'dynamicRoute');
        console.log(newRoute, 'newRoute');
        

        // if (dynamicRoute && dynamicRoute.length > 0) {
        //     for (let i = 0; i < dynamicRoute.length; i += 1) {
        //         const menu = dynamicRoute[i];
        //         newRoute.items.push(menu);
        //         newRoute.routes.push(menu);
        //     }

        //     route.routes = newRoute.routes;
        //     route.items = newRoute.routes;
        //     setLoad(true);

        //     if (location.pathname && location.pathname !== '/') {
        //         history.replace(location.pathname);
        //     }
        // }
    }, [dynamicRoute, load]);


   

    useEffect(() => {
      if (location.pathname === '/' && firstPath && firstPath !== '/') {
        history.push(firstPath)
      }
    }, [location.pathname]);
  

    const renderMenuItem = (title: string, hasSub: boolean, icon?: string) => {
      return (
        <span className="ant-pro-menu-item" title={title}>
          {/* {!icon ? undefined : <Icon type={icon} />} */}
          <span className="ant-pro-menu-item-title">{title}</span>
        </span>
      );
    };

  return (
    <ProLayout
      title={defaultSettings.title}
      logo={defaultSettings.logo}
      pure={false}
      loading={false}
      location={location}
      appList={[
        {
          icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
          title: 'Ant Design',
          desc: '杭州市较知名的 UI 设计语言',
          url: 'https://ant.design',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
          title: 'AntV',
          desc: '蚂蚁集团全新一代数据可视化解决方案',
          url: 'https://antv.vision/',
          target: '_blank',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
          title: 'Pro Components',
          desc: '专业级 UI 组件库',
          url: 'https://procomponents.ant.design/',
        },
        {
          icon: 'https://img.alicdn.com/tfs/TB1zomHwxv1gK0jSZFFXXb0sXXa-200-200.png',
          title: 'umi',
          desc: '插件化的企业级前端应用框架。',
          url: 'https://umijs.org/zh-CN/docs',
        },

        {
          icon: 'https://gw.alipayobjects.com/zos/bmw-prod/8a74c1d3-16f3-4719-be63-15e467a68a24/km0cv8vn_w500_h500.png',
          title: 'qiankun',
          desc: '可能是你见过最完善的微前端解决方案🧐',
          url: 'https://qiankun.umijs.org/',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
          title: '语雀',
          desc: '知识创作与分享工具',
          url: 'https://www.yuque.com/',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/rmsportal/LFooOLwmxGLsltmUjTAP.svg',
          title: 'Kitchen ',
          desc: 'Sketch 工具集',
          url: 'https://kitchen.alipay.com/',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
          title: 'dumi',
          desc: '为组件开发场景而生的文档工具',
          url: 'https://d.umijs.org/zh-CN',
        },
      ]}
      // appListRender={()=> <AppListRender />}
      route={routeConfig}
      // route={dynamicRoute}
      menu={{ request: async () => dynamicRoute }}
      navTheme="light"
      layout={defaultSettings.layout as 'top' | 'side' | 'mix'}
      contentWidth={defaultSettings.contentWidth as 'Fluid' | 'Fixed'}
      headerTitleRender={(logo, title, _) => {
        const defaultDom = (
          <a>
            {logo}
            {title}
          </a>
        );
        if (typeof window === 'undefined') return defaultDom;
        if (document.body.clientWidth < 1400) {
          return defaultDom;
        }
        if (_.isMobile) return defaultDom;
        return (
          <>
            {defaultDom}
            <MenuCard />
          </>
        );
      }}
    
      menuItemRender={(item, dom) => {
        if (item.path && location.pathname !== item.path) {
          return <Link to={item.path}>{dom}</Link>;
        }
        return dom;
      }}
      fixedHeader={defaultSettings.fixedHeader}
      fixSiderbar={defaultSettings.fixSiderbar}
      siderWidth={236}
      footerRender={() => <Footer />}
      actionsRender={(props) => {
        if (props.isMobile) return [];
        return [
          props.layout !== 'side' ? (
            <SearchInput />
          ) : undefined,
          <InfoCircleFilled key="InfoCircleFilled" />,
          <QuestionCircleFilled key="QuestionCircleFilled" />,
          <GithubFilled key="GithubFilled" />,
        ];
      }}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        size: 'small',
        title: '七妮妮',
      }}
      headerContentRender={() => {
        return (
          <AvatarDropdown />
        );
      }}
      onMenuHeaderClick={(e) => {
        e?.stopPropagation?.();
        history.push('/');
      }}
      
      breadcrumbRender={(routers) =>
        routers?.map((r) => ({
          path: r.path,
          breadcrumbName: r.breadcrumbName || (r.title as string),
        }))
      }
  
      {...initialState?.settings}
    >
      <WaterMark
        content={
          defaultSettings?.waterMark
            ? initialState?.user?.info?.nickname
            : undefined
        }
        style={{ height: '100%' }}
      >
        <Outlet />
      </WaterMark>

      <SettingDrawer
        pathname={location.pathname}
        enableDarkTheme
        settings={(initialState as any)?.settings}
        onSettingChange={(changeSetting) => {
          const nextSettings = { ...initialState?.settings, ...changeSetting };
          setInitialState({ ...initialState, settings: nextSettings });
          LayoutSetting.set(nextSettings);
        }}
        disableUrlParams
      />
    </ProLayout>
  );
};

export default BaseLayouts;
