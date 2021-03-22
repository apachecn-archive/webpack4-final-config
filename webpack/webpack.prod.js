const { merge } = require("webpack-merge");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const config = require("./webpack.common");

module.exports = merge(config, {
  // https://v4.webpack.docschina.org/configuration/other-options/#bail
  bail: true,
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].js",
  },
  optimization: {
    minimize: true,
    /**
     * 对于动态导入模块，默认使用 webpack v4+ 提供的全新的通用分块策略(common chunk strategy)。
     * 请在 SplitChunksPlugin 页面中查看配置其行为的可用选项。
     * https://v4.webpack.docschina.org/plugins/split-chunks-plugin/
     */
    splitChunks: {
      /**
       * https://v4.webpack.docschina.org/plugins/split-chunks-plugin/#splitchunks-chunks
       * all：把动态和非动态模块同时进行优化打包；所有模块都扔到 vendors.bundle.js 里面。
       * initial：把非动态模块打包进 vendor，动态模块优化打包
       * async：把动态模块打包进 vendor，非动态模块保持原样（不优化）
       */
      chunks: "all",
      /**
       * 缓存：https://v4.webpack.docschina.org/guides/caching/
       * splitChunks.cacheGroups：https://v4.webpack.docschina.org/plugins/split-chunks-plugin/#splitchunks-cachegroups
       */
      cacheGroups: {
        // https://v4.webpack.docschina.org/guides/caching#%E6%8F%90%E5%8F%96%E5%BC%95%E5%AF%BC%E6%A8%A1%E6%9D%BF-extracting-boilerplate-
        runtimeChunk: "single",
        /**
         * 以下配置相关的文档
         * https://v4.webpack.docschina.org/plugins/split-chunks-plugin/#split-chunks-example-1
         * https://v4.webpack.docschina.org/plugins/split-chunks-plugin/#defaults-example-2
         */
        // commons: {
        //   name: "commons",
        //   chunks: "initial",
        //   minChunks: 2,
        // },
        /**
         * 将node_modules中的包，打包为：vendors.chunk.js
         * https://v4.webpack.docschina.org/plugins/split-chunks-plugin/#split-chunks-example-2
         */
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        /**
         * 将react和react-dom包，打包为：react-vendor.chunk.js
         */
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react-vendor",
          chunks: "all",
        },
      },
    },
    // webpack5可以在 optimization.minimizer 中可以使用 '...' 来访问默认值。
    minimizer: [
      /**
       * 压缩js：https://v4.webpack.docschina.org/plugins/terser-webpack-plugin/
       * webpack4 和 terser-webpack-plugin@5.x不兼容。webpack4请使用4.x版本
       */
      new TerserPlugin(),
      // 压缩css：https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production", // 除非有定义 process.env.NODE_ENV，否则就使用 'development'
    }),
    // 清除output.path的文件
    new CleanWebpackPlugin(),
  ],
});
