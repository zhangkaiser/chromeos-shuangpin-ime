let path = require("path");
let webpack = require("webpack");

module.exports = {
  entry: {
    background: './src/entries/ime-ui.ts',
    main: "./src/entries/main.ts",
    decoder: "./src/backgrounds/ime.ts"
  },
  mode: "development",
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
    })
  ]
}