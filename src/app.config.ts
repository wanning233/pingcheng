export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/preference/index',
    'pages/route-compare/index',
    'pages/invite/landing/index',
  ],
  subPackages: [
    { root: 'pages/route-detail', pages: ['index'] },
    { root: 'pages/assistant', pages: ['index'] },
    { root: 'pages/map-fullscreen', pages: ['index'] },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0D0D12',
    navigationBarTitleText: '拼程',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0D0D12',
  },
  style: 'v2',
})
