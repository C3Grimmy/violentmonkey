const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const babiliPreset = require('babel-preset-babili');
const vueLoaderConfig = require('./vue-loader.conf');
const { IS_DEV, styleRule } = require('./utils');

const { MINIFY } = process.env;
const DIST = 'dist';
const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    DEBUG: IS_DEV ? 'true' : 'false', // whether to log message errors
  },
});

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  output: {
    path: resolve(DIST),
    publicPath: '/',
    filename: '[name].js',
  },
  resolve: {
    // Tell webpack to look for peer dependencies in `node_modules`
    // when packages are linked from outside directories
    modules: [resolve('node_modules')],
    extensions: ['.js', '.vue'],
    alias: {
      src: resolve('src'),
    }
  },
  node: {
    // css-loader requires unnecessary `Buffer` polyfill,
    // which increases the bundle size significantly.
    // See:
    // - https://github.com/webpack-contrib/css-loader/issues/454
    // - https://github.com/vuejs/vue-loader/issues/720
    Buffer: false,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      styleRule({
        fallback: 'vue-style-loader',
        loaders: ['postcss-loader'],
      }),
    ],
  },
  // cheap-module-eval-source-map is faster for development
  devtool: IS_DEV ? '#inline-source-map' : false,
  plugins: [
    definePlugin,
    !IS_DEV && new MinifyPlugin({
      mangle: !!MINIFY,
    }, {
      babili: (...args) => Object.assign(babiliPreset(...args), {
        minified: !!MINIFY,
        compact: !!MINIFY,
      }),
    }),
  ].filter(Boolean),
};
