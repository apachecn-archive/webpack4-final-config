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
