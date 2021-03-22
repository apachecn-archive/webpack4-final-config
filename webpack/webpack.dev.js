const { merge } = require("webpack-merge");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const config = require("./webpack.common");

module.exports = merge(config, {
  // https://v4.webpack.docschina.org/configuration/dev-server/
  devServer: {
    /**
     * 启用 webpack 的 Hot Module Replacement 功能
     * 模块热替换(hot module replacement): https://v4.webpack.docschina.org/concepts/hot-module-replacement/
     * 模块热替换：https://v4.webpack.docschina.org/guides/hot-module-replacement/
     * using-webpack-dev-middleware（express形式的）：https://webpack.js.org/guides/development/#using-webpack-dev-middleware
     */
    hot: true,
    // 为每个静态文件开启 gzip compression
    compress: true,
    port: 9000,
    // open: true,
    // openPage: "xxx/xxx",
    // proxy: {
    //   "/test": {
    //     target: "http://localhost:9000",
    //     changeOrigin: true,
    //   },
    // },
  },
  module: {
    rules: [],
  },
  plugins: [
    // https://v4.webpack.docschina.org/plugins/environment-plugin/
    new webpack.EnvironmentPlugin(),
    /**
     * 开发模式下使用fork-ts-checker-webpack-plugin进行ts类型检查
     * 文档：https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
     */
    new ForkTsCheckerWebpackPlugin(),
    // 模块热替换
    new webpack.HotModuleReplacementPlugin(),
    // react 组件有状态刷新
    new ReactRefreshWebpackPlugin(),
  ],
});
