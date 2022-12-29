let path = require("path");
let webpack = require("webpack");

let CopyWebpackPlugin = require("copy-webpack-plugin");

let mode = "development";
if (process.env.PRODUCTION) mode = "production";

const copyPatterns = [
  {from: "./googlepinyin/out/index.wasm", to: "."},
  {from: "./src/asset", to: "."},
  {from: "./src/manifests/manifest_decoder.json", to: "./manifest.json"}
]

module.exports = {
  entry: {
    background: "./src/chrome-extension.ts",
    options: "./src/option.ts"
  },
  mode: mode,
  output: {
    path: path.resolve(process.cwd(), "./out"),
    filename: '[name].js'
  },
  module: {
    rules: [
      {test: /\.ts$/, use: "ts-loader"}
    ]
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", "..."],
    alias: {
      src: path.resolve(process.cwd(), "src"),
      googlepinyin: path.resolve(process.cwd(), "googlepinyin")
    },
    fallback: {
      "path": false,
      "perf_hooks": false,
      fs: false,
      worker_threads: false,
      crypto: false,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.CHROME_OS": true,
      "process.env.WEB": false,
      "process.env.CODE": false
    }),
    new CopyWebpackPlugin({
      patterns: copyPatterns
    })

  ]
}