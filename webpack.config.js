let path = require("path");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    "background": "./src/background.ts",
    "popup": "./src/popup.ts",
    "option": "./src/option.ts",
    "test": "./src/tests/test_decoder.ts"
  },
  mode: "development",
  output: {
    filename: "[name].js"
  },
  module: {
    rules: [
      {test: /\.ts$/, use:'ts-loader'}
    ]
  },
  devtool: false,
  watch: true,
  resolve: {
    "extensions": [".ts", "..."]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: "./src/manifest.json", to: "."},
        {from: "./src/asset", to: "."}
      ]
    })
  ]
}