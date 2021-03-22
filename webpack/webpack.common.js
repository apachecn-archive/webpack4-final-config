const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const loaders = require("./loaders");

const pro = process.env.NODE_ENV === "production";
const dev = process.env.NODE_ENV === "development";

const styleLoaders = loaders.styleLoaders(process.env.NODE_ENV);

module.exports = {
  // https://v4.webpack.docschina.org/configuration/mode/
  mode: "development",
  entry: {
    main: path.resolve(__dirname, "../src/index.tsx"),
  },
  // https://v4.webpack.docschina.org/configuration/entry-context/#context
  context: path.resolve(__dirname, "../"),
  /**
   * https://v4.webpack.docschina.org/configuration/devtool/
   * false：具有最佳性能的生产版本的推荐选择
   * eval：具有最佳性能的开发构建的推荐选择。
   * source-map：具有高质量SourceMaps的生产版本的推荐选择
   * hidden-source-map - 与 source-map 相同，但不会为 bundle 添加引用注释。如果你只想 source map 映射那些源自错误报告的错误堆栈跟踪信息，但不想为浏览器开发工具暴露你的 source map，这个选项会很有用。
   * nosources-source-map - 创建的 source map 不包含 sourcesContent(源代码内容)。它可以用来映射客户端上的堆栈跟踪，而无须暴露所有的源代码。你可以将 source map 文件部署到 web 服务器
   */
  devtool: "nosources-source-map",
  output: {
    /**
     * 文档：https://v4.webpack.docschina.org/configuration/output/#output-filename
     * [hash]、[chunkhash]、[name]、[id]、[query]的意思也在此文档中
     */
    filename: "js/[name].js",
    // https://v4.webpack.docschina.org/configuration/output/#output-chunkfilename
    chunkFilename: "js/[name].chunk.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "../dist"),
    // https://v4.webpack.docschina.org/configuration/output/#output-publicpath
    publicPath: "/",
  },
  resolve: {
    extensions: [".wasm", ".mjs", ".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    // 浏览器版本查询及意思：https://github.com/browserslist/browserslist#full-list
                    targets: ["last 2 version", "> 1%"],
                    // 当文件里被使用时, 添加特定的引入来语法填充, 我们利用它, 一个打包的文件只会加载一次相同的语法填充
                    useBuiltIns: "usage",
                    // 指定corejs的版本
                    corejs: "3",
                  },
                ],
                // "@babel/preset-react",
                // "@babel/preset-typescript",
              ],
              plugins: [
                /**
                 * babel-plugin-import：实现按需加载，主要用于antd，antd-mobile，lodash，material-ui库实现按需加载
                 * 使用了这个，就不需要在入口文件中引入：import "antd/dist/antd.css";
                 * 文档：https://github.com/ant-design/babel-plugin-import
                 * 出现以下错误，说明缺少相关loader，这个错误是提示缺少less-loader，style: true 会加载 less 文件
                 * ERROR in /Users/mark/projects/code-demo/webpack-babel-demo/node_modules/antd/lib/button/style/index.less 1:0
                 * Module parse failed: Unexpected character '@' (1:0)
                 * You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://v4.webpack.js.org/concepts#loaders
                 */
                [
                  "import",
                  {
                    libraryName: "antd",
                    // 默认值 lib，为「lib」会导致vendors~main.js打包过大，改为「es」则符合预期
                    libraryDirectory: "es",
                    // style: true 会加载 less 文件
                    style: "css",
                  },
                ],
                "@babel/plugin-transform-runtime",
                // // 用于ts+react的热更新
                dev && "react-refresh/babel",
              ].filter(Boolean),
            },
          },
          {
            loader: "ts-loader",
            options: {
              // 关闭类型检查，类型交给fork-ts-checker-webpack-plugin
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [...styleLoaders].filter(Boolean),
      },
      {
        test: /\.scss$/i,
        use: [...styleLoaders, "sass-loader"].filter(Boolean),
      },
      {
        test: /\.less$/i,
        use: [
          ...styleLoaders,
          {
            /**
             * 将 Less 文件编译为 CSS 文件：https://v4.webpack.docschina.org/loaders/less-loader/
             * CSS modules 陷阱：https://v4.webpack.docschina.org/loaders/less-loader/#css-modules-gotcha
             */
            loader: "less-loader",
            options: {
              lessOptions: {
                /**
                 * javascriptEnabled 在less 3.0.0中已废弃，不推荐使用：http://lesscss.org/usage/#command-line-usage-options
                 *
                 * 如果less代码中使用了内联javascript，如果不设置javascriptEnabled: true，则会出现以下错误：
                 * // https://github.com/ant-design/ant-motion/issues/44
                 * .bezierEasingMixin();
                 * ^
                 * Inline JavaScript is not enabled. Is it set in your options?
                 */
                // javascriptEnabled: true,
              },
              sourceMap: true,
            },
          },
        ].filter(Boolean),
      },
      /**
       * https://v4.webpack.docschina.org/loaders/url-loader/
       * url-loader已经集成了file-loader的功能
       * 针对于图像的加载loader可以参考：https://github.com/tcoopman/image-webpack-loader
       */
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: "url-loader",
        options: {
          limit: 8192,
          outputPath: "assets/images",
          name: "[name].[ext]",
        },
      },
      /**
       * SVG 可以被压缩至体积更小，尽量避免使用 base64
       * https://webpack.docschina.org/loaders/url-loader/#svg
       * 使用mini-svg-data-uri来处理：https://github.com/tigt/mini-svg-data-uri
       * webpack 5 以后就使用asset-modules进行文件资源处理了：https://webpack.docschina.org/guides/asset-modules/
       */
      {
        test: /\.svg$/i,
        loader: "url-loader",
        options: {
          generator: (content) => svgToMiniDataURI(content.toString()),
        },
      },
      // 加载字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    /**
     * mini-css-extract-plugin：将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
     * https://v4.webpack.docschina.org/plugins/mini-css-extract-plugin/
     */
    pro &&
      new MiniCssExtractPlugin({
        /**
         * 类似于 webpackOptions.output 中的选项
         * 所有选项都是可选的
         * 使用 filename: "[contenthash].css" 启动长期缓存。根据需要添加 [name]。
         */
        filename: pro ? "css/[name].[contenthash].css" : "css/[name].css",
        chunkFilename: pro ? "css/[id].[contenthash].css" : "css/[id].css",
      }),
  ].filter(Boolean),
};
