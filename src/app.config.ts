export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/invite/index',
    'pages/preference/index',
    'pages/route-compare/index',
    'pages/invite/landing/index',
    'pages/map-fullscreen/index',
    'pages/route-detail/index',
  ],
  subPackages: [
    { root: 'pages/assistant', pages: ['index'] },
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FAFAFA',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAFAFA',
  },
  tabBar: {
    color: '#AAAAAA',
    selectedColor: '#FF6B2B',
    backgroundColor: '#FAFAFA',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '出发',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png',
      },
      {
        pagePath: 'pages/invite/index',
        text: '邀请',
        iconPath: 'assets/tab/group.png',
        selectedIconPath: 'assets/tab/group-active.png',
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '用于在地图上显示你的当前位置',
    },
  },
  style: 'v2',
})
