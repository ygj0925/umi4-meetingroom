export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: '登录',
        component: './user/login',
      },
      { path: '/user', redirect: '/user/login' },
      { component: '404', path: '/user/*' },
    ],
  },

  { component: '404', path: '/*' },
];
