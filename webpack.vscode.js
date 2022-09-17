const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(process.cwd(), "vscode"),
    // clean: true,
    filename: "extension.js",
    // chunkFormat: "commonjs",
    // chunkLoading: "require",
    // scriptType: "module",
    libraryTarget: "commonjs2",
    // module: true
  },
  mode: "development",
  target: "node",
  module: {
    rules: [
      {test: /\.ts$/, exclude: /node_modules/, use: "ts-loader"}
    ]
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", "..."],
    alias: {
      src: path.resolve(process.cwd(), "src")
    }
  },
  externals: {
    vscode: "vscode",
    "./libGooglePinyin/Decoder.js": "./decoder.js"
  },
  // experiments: {
  //   outputModule: true
  // },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: "./src/manifests/vscode.json", to: "./package.json"},
        {from: "./libGooglePinyin/decoder.wasm", to: "./decoder.wasm"},
        {from: "./libGooglePinyin/decoder.js", to: "./decoder.js"}
      ]
    })
  ]
}