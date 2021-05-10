# 2021 年配置 webpack4 是怎么样的一种体验

webpack4 于 2018 年 2 月发布，webpack5 于 2020 年 10 月发布。两年时间 webpack 带来了一次大版本的升级。[Webpack 5 发布公告](https://webpack.docschina.org/blog/2020-10-10-webpack-5-release/)。

就像 webpack5 发布公告中所说：`人们通常一年只接触两次，剩下的时间就 "只管用 "了`的一样，大部分人都是在新版本推出之际仔细通读文档，后面小版本的更迭及优化则变得不那么仔细了。

在 2021 年 2 月的此时，离 webpack5 的发布已经 5 月有余，最新版本为[v5.24.2](https://github.com/webpack/webpack/releases/tag/v5.24.2)。有的同学已经早早用了，当然期间肯定会遇到一些 bug 和问题。就像公告中所说的：`如果你愿意的话，现在就尝试升级，并向 webpack、插件和加载器提供反馈。 我们很想解决这些问题。总得有人开始，而你将是第一批受益者之一。`

对于 webpack4 来说，此时此刻也是它最稳定的时候。那么对于最稳定的 4 版本，是时候做个告别，来迎接新的未来了。所以下面就让我们最后一次感受一下 2021 年配置 webpack4 是怎么样的一种体验吧。

**以下示例以 react+typescript 项目为例**

- node 版本：>=12
- typescript 版本：>=4
- react 版本：17

# 安装 webpack 相关

```bash
npm i webpack@4.x webpack-cli@3.x webpack-dev-server@3.x html-webpack-plugin@4.x webpack-merge@5.x clean-webpack-plugin@3.x -D
```

## 新建 webpack 相关文件

- 可以创建一个`webpack.config.js`文件，当然也可以创建一个文件夹 webpack，里面根据不同环境建多个文件如：`webpack.dev.js、webpack.prod.js`等。

- 如果要根据 webpack.config.js 中的 mode 变量更改打包行为，则必须将配置导出为函数，而不是导出对象。[参考文档](https://v4.webpack.docschina.org/configuration/configuration-types/)

  ```javascript
  var config = {
    entry: "./app.js",
    //...
  };

  module.exports = (env, argv) => {
    if (argv.mode === "development") {
      config.devtool = "source-map";
    }

    if (argv.mode === "production") {
      //...
    }

    return config;
  };
  ```

- 这里我们新建 webpack 文件，在其中新建`webpack.common.js、webpack.dev.js、webpack.prod.js`

## 初始配置

### 安装相关 loader

```
npm i url-loader@4.x file-loader@6.x mini-svg-data-uri@1.x -D
```

### webpack.common.js

```javascript
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

module.exports = {
  // https://v4.webpack.docschina.org/configuration/mode/
  mode: "development",
  entry: {
    main: "./src/index.tsx",
  },
  // https://v4.webpack.docschina.org/configuration/entry-context/#context
  // context: path.resolve(__dirname, "somePath"),
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
  ],
};
```

### webpack.dev.js

开发环境服务选择，[参考文档](https://v4.webpack.docschina.org/guides/development/)

这里我们选择的是`webpack-dev-server`

[使用 webpack-dev-middleware，点这里](https://v4.webpack.docschina.org/guides/development/#%E4%BD%BF%E7%94%A8-webpack-dev-middleware)

```javascript
const { merge } = require("webpack-merge");
const webpack = require("webpack");

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
    open: true,
    // openPage: "xxx/xxx",
    // proxy: {
    //   "/test": {
    //     target: "http://localhost:9001",
    //     changeOrigin: true,
    //   },
    // },
  },
  plugins: [
    // https://v4.webpack.docschina.org/plugins/environment-plugin/
    // 除非有定义 process.env.NODE_ENV，否则就使用 'development'
    new webpack.EnvironmentPlugin(),
  ],
});
```

### webpack.prod.js

```javascript
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const config = require("./webpack.common");

module.exports = merge(config, {
  // https://v4.webpack.docschina.org/configuration/other-options/#bail
  bail: true,
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].js",
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
    // 清除output.path的文件
    new CleanWebpackPlugin(),
  ],
});
```

## 因为是 typescript+react 项目

这里使用`ts-loader`来加载`.tsx和.ts`文件

当然也可以使用`babel-loader`来代替`ts-loader`，相关 presets：

- [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)
- [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)
- [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)

```
// react 17, typescript4.x
npm i @types/react@17.x @types/react-dom@17.x -D

npm i react@17.x react-dom@17.x -S

// loader
npm i ts-loader@8.x fork-ts-checker-webpack-plugin@6.x -D
```

### webpack.common.js

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // 关闭类型检查，类型交给fork-ts-checker-webpack-plugin
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
};
```

### webpack.dev.js

```javascript
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const config = require("./webpack.common");

module.exports = merge(config, {
  plugins: [
    /**
     * 开发模式下使用fork-ts-checker-webpack-plugin进行ts类型检查
     * 文档：https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
     */
    new ForkTsCheckerWebpackPlugin(),
  ],
});
```

## js 的兼容性

使用`babel-loader`处理 js 兼容性，需要安装相关 babel 工具链

```bash
npm i @babel/core@7.x babel-loader@8.x @babel/preset-env@7.x @babel/plugin-transform-runtime@7.x babel-plugin-import@1.x -D
```

```bash
npm i @babel/runtime@7.x core-js@3.x -S
```

- [core-js：babel 依赖的 polyfill 核心库](https://github.com/zloirock/core-js)

* [@babel/plugin-transform-runtime：一个插件，可重新使用 Babel 注入的帮助程序代码以节省代码大小，作为开发环境依赖](https://babeljs.io/docs/en/babel-plugin-transform-runtime)

- [@babel/runtime：替代@babel/plugin-transform-runtime 作为生产环境依赖](https://babeljs.io/docs/en/babel-runtime)

* [@babel/preset-env：是一个智能的 babel 预设, 让你能使用最新的 JavaScript 语法, 它会帮你转换成代码的目标运行环境支持的语法, 提升你的开发效率并让打包后的代码体积更小](https://babeljs.io/docs/en/babel-preset-env)

- [babel-loader：webpack loader，不仅可以用来打包还可以实现 react 项目有状态热更新](https://github.com/babel/babel-loader)

- [babel-plugin-import：实现按需加载，主要用于 antd，antd-mobile，lodash，material-ui 库实现按需加载](https://github.com/ant-design/babel-plugin-import)

### webpack.common.js

```javascript
module.exports = {
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
              ],
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
    ],
  },
};
```

## react 组件启用有状态刷新

有状态刷新在开发模式下可提高效率

- [react-refresh-webpack-plugin：一个 Webpack 插件，用于为 React 组件启用“快速刷新”（以前也称为热更新）](https://github.com/pmmmwh/react-refresh-webpack-plugin)

```bash
npm i react-refresh@0.x @pmmmwh/react-refresh-webpack-plugin@0.x -D
```

```javascript
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = {
  //...,
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              //...,
              plugins: [
                //...,
                "@babel/plugin-transform-runtime",
                // 用于ts+react的热更新
                "react-refresh/babel",
              ],
            },
          },
          //...,
        ],
      },
    ],
  },
  plugins: [
    //...,
    // 模块热替换
    new webpack.HotModuleReplacementPlugin(),
    // react 组件有状态刷新
    new ReactRefreshWebpackPlugin(),
  ],
};
```

## 处理样式

### loaders

- [css-loader](https://v4.webpack.docschina.org/loaders/css-loader/)
  - [css modules](https://github.com/css-modules/css-modules)
  - [css-loader/modules](https://v4.webpack.docschina.org/loaders/css-loader/#modules)
  - [可以使用 `@value` 来指定在整个文档中都能被重复使用的值](https://v4.webpack.docschina.org/loaders/css-loader/#values)
  - [纯 CSS，CSS 模块和 PostCSS](https://webpack.docschina.org/loaders/css-loader/#pure-css-css-modules-and-postcss)
- [postcss-loader](https://github.com/webpack-contrib/postcss-loader)
- [postcss-preset-env](https://github.com/webpack-contrib/postcss-loader#postcss-preset-env)
  - [开启关闭/忽略 autoprefixer](https://github.com/postcss/autoprefixer#control-comments)
- [style-loader](https://v4.webpack.docschina.org/loaders/style-loader/)
- [less-loader](https://v4.webpack.docschina.org/loaders/less-loader/)
- [sass-loader](https://v4.webpack.docschina.org/loaders/sass-loader/)
- [提取 CSS：mini-css-extract-plugin](https://v4.webpack.docschina.org/plugins/mini-css-extract-plugin/)

```bash
npm i postcss-loader@4.x postcss-preset-env@6.x css-loader@5.x less-loader@7.x less@4.x sass-loader@10.x sass@1.x style-loader@2.x mini-css-extract-plugin@1.x -D
```

### 为了便于公用 loader，我们将公用的 loaders 写成如下：

```javascript
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * css-loader
 * 如果由于某种原因，你需要将 CSS 提取为纯粹的 字符串资源（即不包含在 JS 模块中），则可能需要 查看 extract-loader。
 * 比如，当你需要对 CSS 进行后处理时，会非常有用。extract-loader：https://v4.webpack.docschina.org/loaders/extract-loader/
 * mini-css-extract-plugin：https://v4.webpack.docschina.org/plugins/mini-css-extract-plugin/
 * 最佳实践：https://webpack.docschina.org/plugins/mini-css-extract-plugin/#common-use-case
 * 开发模式下使用style-loader，生产模式下使用mini-css-extract-plugin
 */
const styleLoaders = (env) => {
  const pro = env === "production";
  const dev = env === "development";
  return [
    /**
     * style-loader：把 CSS 插入到 DOM 中
     * https://v4.webpack.docschina.org/loaders/style-loader/
     * 开发模式下建议使用style-loader
     */
    dev && "style-loader",
    /**
     * mini-css-extract-plugin：将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
     * https://v4.webpack.docschina.org/plugins/mini-css-extract-plugin/
     * 通用例子：https://webpack.docschina.org/plugins/mini-css-extract-plugin/#common-use-case
     * 生产环境建议使用：mini-css-extract-plugin
     * 生产模式建议压缩css文件：使用css-minimizer-webpack-plugin：https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/
     */
    pro && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        /**
         * 你可以在这里指定特定的 publicPath
         * 默认情况下使用 webpackOptions.output 中的 publicPath
         */
        publicPath: (resourcePath, context) => {
          // publicPath 是资源相对于上下文的相对路径
          // 例如：对于 ./css/admin/main.css publicPath 将会是 ../../
          // 而对于 ./css/main.css publicPath 将会是 ../
          return path.relative(path.dirname(resourcePath), context) + "/";
        },
      },
    },
    {
      loader: "css-loader",
      options: {
        sourceMap: true,
        /**
         * 配置css modules
         * 配置文档：https://v4.webpack.docschina.org/loaders/css-loader/#modules
         * css modules 使用文档：https://github.com/css-modules/css-modules
         * 可以使用 `@value` 来指定在整个文档中都能被重复使用的值: https://v4.webpack.docschina.org/loaders/css-loader/#values
         * 纯 CSS，CSS 模块和 PostCSS：https://webpack.docschina.org/loaders/css-loader/#pure-css-css-modules-and-postcss
         */
        modules: {
          // mudules.auto：https://webpack.docschina.org/loaders/css-loader/#auto
          // auto: true,
          /**
           * https://webpack.docschina.org/loaders/css-loader/#mode
           * 回调必须返回 `local`，`global`，或者 `pure`
           */
          mode: (resourcePath) => {
            if (/pure.css$/i.test(resourcePath)) {
              return "pure";
            }

            if (/module.(css|less|scss)$/i.test(resourcePath)) {
              return "local";
            }

            if (/global.css$/i.test(resourcePath)) {
              return "global";
            }

            return "global";
          },
          // local的标识名称
          localIdentName: "[path][name]__[local]--[hash:base64:5]",
        },
      },
    },
    /**
     * https://github.com/webpack-contrib/postcss-loader
     */
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            [
              /**
               * https://github.com/webpack-contrib/postcss-loader#postcss-preset-env
               * postcss-preset-env包含autoprefixer，因此如果您已经使用预设，则无需单独添加它。更多信息
               * 开启关闭/忽略autoprefixer: https://github.com/postcss/autoprefixer#control-comments
               */
              "postcss-preset-env",
              {
                // Options
              },
            ],
          ],
        },
      },
    },
  ];
};

module.exports = {
  styleLoaders,
};
```

### webpack.common.js

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const loaders = require("./loaders");

const pro = process.env.NODE_ENV === "production";

const styleLoaders = loaders.styleLoaders(process.env.NODE_ENV);

module.exports = {
  //...,
  module: {
    rules: [
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
    ],
  }
  plugins: [
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
        filename: pro
          ? "css/[name].[contenthash].css"
          : "css/[name].css",
        chunkFilename: pro
          ? "css/[id].[contenthash].css"
          : "css/[id].css",
      }),
  ].filter(Boolean),
};
```

## 压缩、优化

开发模式下不需要进行压缩优化，只需在生产模式下进行。

```bash
npm i terser-webpack-plugin@4.x css-minimizer-webpack-plugin@1.x -D
```

### webpack.pro.js

```javascript
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  //...,
  /**
   * https://v4.webpack.docschina.org/configuration/optimization/
   * 从 webpack 4 开始，会根据你选择的 mode 来执行不同的优化， 不过所有的优化还是可以手动配置和重写
   * 代码分离：https://v4.webpack.docschina.org/guides/code-splitting/
   */
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
};
```

## 最后

到这里，差不多就是 2021 年配置 webpack4 的体验了。相比之前，确实是不那么复杂了许多。以上配置，有诸多细节并没有深入，各方工具基本上是官方默认配置。要摸清诸多的配置细节需下不少功夫，更要深入各部分文档一探究竟。

秉着好记性不如烂笔头的原则，给 webpack4 一个简单的总结，也是给自己温习配置 webpack4 过程的一个总结。
