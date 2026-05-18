// https://umijs.org/config/

import { join } from 'node:path';
import { defineConfig } from '@umijs/max';
import CompressionPlugin from 'compression-webpack-plugin';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev', NODE_ENV = 'development' } = process.env;

/**
 * @name 使用公共路径
 * @description 部署时的路径，如果部署在非根目录下，需要配置这个变量
 * @doc https://umijs.org/docs/api/config#publicpath
 */
const PUBLIC_PATH: string = '/';

const isProd = NODE_ENV === 'production';
export default defineConfig({
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  extraBabelPlugins: [isProd ? 'transform-remove-console' : ''],
  hash: true,
  history: {
    type: defaultSettings.historyType,
  },
  metas: [
    {
      name: 'viewport',
      content:
        'width=device-width initial-scale=1.0 maximum-scale=1.0  viewport-fit=cover minimum-scale=1, user-scalable=no',
    },
  ],
  publicPath: PUBLIC_PATH,
  /**
   * @name 兼容性设置
   * @description 设置 ie11 不一定完美兼容，需要检查自己使用的所有依赖
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name 路由的配置，不在路由中引入的文件不会编译
   * @description 只支持 path，component，routes，redirect，wrappers，title 的配置
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  // 启用约定式布局，使 src/layouts/index.tsx 生效
  conventionLayout: true,
  /**
   * @name 主题的配置
   * @description 虽然叫主题，但是其实只是 less 的变量设置
   * @doc antd的主题设置 https://ant.design/docs/react/customize-theme-cn
   * @doc umi 的 theme 配置 https://umijs.org/docs/api/config#theme
   */
  // theme: { '@primary-color': '#1DA57A' }
  /**
   * @name moment 的国际化配置
   * @description 如果对国际化没有要求，打开之后能减少js的包大小
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name 代理配置
   * @description 可以让你的本地服务器代理到你的服务器上，这样你就可以访问服务器的数据了
   * @see 要注意以下 代理只能在本地开发时使用，build 之后就无法使用了。
   * @doc 代理介绍 https://umijs.org/docs/guides/proxy
   * @doc 代理配置 https://umijs.org/docs/api/config#proxy
   */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  /**
   * @name 快速热更新配置
   * @description 一个不错的热更新组件，更新时可以保留 state
   */
  fastRefresh: true,
  //============== 以下都是max的插件配置 ===============
  /**
   * @name 数据流插件
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * 一个全局的初始数据流，可以用它在插件之间共享数据
   * @description 可以用来存放一些全局的数据，比如用户信息，或者一些全局的状态，全局初始状态在整个 Umi 项目的最开始创建。
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name layout 插件
   * @description 设为 false 禁用 Umi 自带的 Pro Layout，改用 layouts 中的自定义 ProLayout
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Ant Design Pro',

  layout: false,
  /**
   * @name moment2dayjs 插件
   * @description 将项目中的 moment 替换为 dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name 国际化插件
   * @doc https://umijs.org/docs/max/i18n
   */
  locale: {
    default: 'zh-CN',
    antd: true,
    title: true,
    baseNavigator: true,
    baseSeparator: '-',
  },
  /**
   * @name antd 插件
   * @description 内置了 babel import 插件
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {
    appConfig: {},
    configProvider: {
      theme: {
        cssVar: true,
        token: {
          fontFamily: 'AlibabaSans, sans-serif',
        },
      },
    },
  },
  /**
   * @name 网络请求配置
   * @description 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name 权限插件
   * @description 基于 initialState 的权限插件，必须先打开 initialState
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name <head> 中额外的 script
   * @description 配置 <head> 中额外的 script
   */
  headScripts: [
    // 解决首次加载时白屏的问题
    {
      src: join(PUBLIC_PATH, 'scripts/loading.js'),
      async: true,
    },
  ],

  //================ pro 插件配置 =================
  presets: ['umi-presets-pro'],
  /**
   * @name openAPI 插件的配置
   * @description 基于 openapi 的规范生成serve 和mock，能减少很多样板代码
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  openAPI: [],

  mock: {
    include: ['mock/**/*', 'src/pages/**/_mock.ts'],
  },
  /**
   * @name 是否开启 mako
   * @description 使用 mako 极速研发
   * @doc https://umijs.org/docs/api/config#mako
   */
  mako: {},
  esbuildMinifyIIFE: true,
  requestRecord: {},
  exportStatic: {},
  define: {
    'process.env.CI': process.env.CI,
  },
  tailwindcss: {},

  chainWebpack: (config: any) => {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          // 共享该module的最小 chunk数量
          minChunks: 2,
          // 最多异步加载该模块
          maxAsyncRequests: 10,
          automaticNameDelimiter: '.',
          // 根据被提取的 chunk 自动生成
          name: true,
          cacheGroups: {
            antd: {
              name: 'antd',
              test({ resource }: any): boolean {
                return (
                  /[\\/]node_modules[\\/]@ant-design[\\/]/.test(resource) ||
                  /[\\/]node_modules[\\/]antd.*[\\/]/.test(resource)
                );
              },
              minChunks: 2,
              reuseExistingChunk: true,
              priority: 30,
            },
            antv: {
              name: 'antv',
              test({ resource }: any): boolean {
                return /[\\/]node_modules[\\/]@antv[\\/]/.test(resource);
              },
              minChunks: 2,
              reuseExistingChunk: true,
              priority: 20,
            },
            vendor: {
              name: 'vendors',
              test({ resource }: any): boolean {
                return /[\\/]node_modules[\\/]/.test(resource);
              },
              minChunks: 2,
              reuseExistingChunk: true,
              priority: 10,
            },
          },
        },
      },
    });
    //在生产环境开启gzip压缩
    if (isProd) {
      // Gzip压缩
      config.plugin('compression-webpack-plugin').use(CompressionPlugin, [
        {
          algorithm: 'gzip',
          test: /\.(js|css|html)$/i, // 匹配
          threshold: 10240, // 超过10k的文件压缩
          deleteOriginalAssets: false, // 不删除源文件
        },
      ]);
    }
  },
});
