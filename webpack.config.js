const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: "development",
  target: "web",
  entry: ["regenerator-runtime/runtime", "./src/index.js"],
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".css"],
    alias: {
      components: path.resolve(__dirname, "src/components"),
    },
    fallback: {
      "fs": false, // Example for modules you don't want to include
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "querystring": require.resolve("querystring-es3"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      "string_decoder": require.resolve("string_decoder/"),
      "net": false,
      "async_hooks": false, 

    },
  },
  devtool: "eval",
  module: {
    rules: [
      { test: /\.(js|jsx)$/, loader: "babel-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(woff(2)?|ttf|eot|jpg|jpeg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[contenthash].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.json5$/i,
        loader: "json5-loader",
        type: "javascript/auto",
        options: {
          esModule: true,
        },
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "build"),
    historyApiFallback: true,
    overlay: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Appka",
    }),
    new NodePolyfillPlugin(),
    // Możesz dodać więcej wtyczek według potrzeb
  ],
};
