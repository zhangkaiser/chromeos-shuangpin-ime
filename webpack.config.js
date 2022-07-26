let path = require("path");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let webpack = require("webpack");

let manifestList = {
  v3: "Manifest v3", // Have bugs,
  v2: "Manifest v2",
  ime: "Input method engine",
  decoder: "Input decoder"
}

// default
let manifests = ["v3"];

if (process.env.MANIFEST) {
  manifests = process.env.MANIFEST.split(",");
}
console.log('MANIFESTS',manifests);

let mode = "development";

if (process.env.PRODUCTION) {
  mode = "production";
}
console.log("MODE", mode);

manifests = manifests.filter(name => name in manifestList);


module.exports = manifests.map((manifest) => {
  let outputPath = "dist/" + manifest;

  let copyPatterns = [
    {from: `./src/manifests/manifest_${manifest}.json`, to: "./manifest.json"},
    {from: "./src/asset", to: "."},
  ]

  let defineObj = {
    "process.env.DECODER": "false",
    "process.env.MAIN": "false",
    "process.env.IME": "false"
  };

  let copyDecoder = {from: "./libGooglePinyin/decoder.wasm", to: "."};
  switch(manifest) {
    case "v3":
    case "v2":
      defineObj['process.env.MAIN'] = JSON.stringify(true);
      copyPatterns.push(copyDecoder);
      break;
    case "decoder":
      defineObj['process.env.DECODER'] = JSON.stringify(true);
      break;
    case "ime":
      defineObj['process.env.IME'] = JSON.stringify(true);
    default:
  }

  return {
    entry: {
      background: "./src/background.ts",
      option: "./src/option.ts"
    },
    mode,
    output: {
      path: path.resolve(process.cwd(), outputPath),
      filename: "[name].js"
    },
    module: {
      rules: [
        {test: /\.ts$/, use: "ts-loader"}
      ]
    },
    devtool: mode === 'development' ? "source-map" : false,
    resolve: {
      extensions: [".ts", "..."],
      alias: {
        src: path.resolve(process.cwd(), 'src')
      }
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: copyPatterns
      }),
      new webpack.DefinePlugin(defineObj)
    ]
  }
})