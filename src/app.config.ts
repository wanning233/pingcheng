export default defineAppConfig({
  entryPagePath: 'pages/home/index',
  pages: [
    'pages/home/index',
    'pages/invite/index',
    'pages/waiting-room/index',
    'pages/ai-questions/index',
    'pages/ai-prompt-preview/index',
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
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  permission: {
    'scope.userLocation': {
      desc: '用于在地图上显示你的当前位置',
    },
  },
  style: 'v2',
})
