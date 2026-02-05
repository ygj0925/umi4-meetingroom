import { defineConfig } from '@umijs/max';

// 提取 defineConfig 的返回值类型
type UmiConfigType = ReturnType<typeof defineConfig>;

// 显式声明类型
let config: UmiConfigType;

if (process.env.UMI_TAG === 'zy') {
  config = defineConfig({
    define: {
      'process.env.msg': JSON.stringify('现在是制药的 prod 环境!'),
      'process.env.companyName': JSON.stringify('三生制药'),
      'process.env.namespaceName': JSON.stringify('BaseWeb3SZY/'),
      'process.env.wxAgentid': JSON.stringify('1000276'),
      'process.env.wxAppid': JSON.stringify('wxa070ce17d52441f5'),
      'process.env.wxRedirectUri': JSON.stringify('https://login.3sbio.com'),
      'process.env.loginUrl': JSON.stringify(
        'https://dev-login.3sbio.com/user/login',
      ),
      'process.env.requestPrefix': JSON.stringify('/api'),
    },
  });
} else {
  config = defineConfig({
    define: {
      'process.env.msg': JSON.stringify('现在是国健的 prod 环境!'),
      'process.env.companyName': JSON.stringify('三生国健'),
      'process.env.namespaceName': JSON.stringify('BaseWeb3SGJ/'),
      'process.env.wxAgentid': JSON.stringify('000167'),
      'process.env.wxAppid': JSON.stringify('ww5cbc027668864f89'),
      'process.env.wxRedirectUri': JSON.stringify(
        'https://dev-login.3s-guojian.com',
      ),
      'process.env.loginUrl': JSON.stringify(
        'https://dev-login.3s-guojian.com/user/login',
      ),
      'process.env.requestPrefix': JSON.stringify('/api'),
    },
  });
}

export default config;
