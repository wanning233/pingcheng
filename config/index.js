const path = require('path')
const config = {
  projectName: 'pincheng',
  date: '2026-04-30',
  designWidth: 750,
  deviceRatio: { 640: 2.34, 750: 1, 828: 1.81 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: { enable: true, config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' } }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'))
    }
  },
  h5: { publicPath: '/', staticDirectory: 'static', router: { mode: 'browser' }, postcss: { autoprefixer: { enable: true } } }
}
module.exports = function(merge) {
  if (process.env.NODE_ENV === 'development') return merge({}, config, require('./dev'))
  return merge({}, config, require('./prod'))
}
