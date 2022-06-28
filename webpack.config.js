let path = require("path");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    // "decoder": "./libGooglePinyin/decoder.js",
    "background": "./src/background.ts",
    "option": "./src/option.ts",
  },
  mode: "production",
  output: {
    // path: "/mnt/chromeos/MyFiles/chrome-shuangpin",
    filename: "[name].js"
  },
  module: {
    rules: [
      {test: /\.ts$/, use:'ts-loader'}
    ]
  },
  devtool: false,
  resolve: {
    "extensions": [".ts", "..."]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: "./src/manifest.json", to: "."},
        {from: "./src/asset", to: "."},
        {from: "./libGooglePinyin/decoder.wasm", to: "."},
        {from: "./libGooglePinyin/decoder.js", to: "."}
      ]
    })
  ]
}