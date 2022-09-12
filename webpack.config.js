let path = require("path");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let webpack = require("webpack");
let rimraf = require("rimraf");
let versions = require("./version.json");
let fs = require("fs");

function versionInc(version) {  
  let arr = version.split(".");
  arr[2] =  (+arr[2]) + 1;
  return arr.join(".");
}


// Development configuration. 
// Need to get after loaded `ui` extension.
const DEV_UI_ID = "enmcjlgogceppnhfkaimbjlcmcnmihbo";

let manifestList = {
  v3: "Manifest v3", // Now, don't support production environment.
  v2: "Manifest v2", // Old version, IME will be resident at runtime. 
  ime: "Input method engine", // Only ui, require decoder.
  decoder: "Input decoder" // Only decoder, require ui.
}

// Default pack `mv3`.
let manifests = ["v3"];
if (process.env.MANIFEST) manifests = process.env.MANIFEST.split(",");
console.log('MANIFESTS', manifests);

// Default development environment.
let mode = "development";
if (process.env.PRODUCTION) mode = "production";
console.log("MODE", mode);

// Default all decoder are packaged together.
let decoder = ["all"];
if (process.env.DECODER_ENGINE) decoder = process.env.DECODER_ENGINE.split(',');
console.log("DECODER ENGINE", decoder);

if (mode === "production") {
  for (let name in versions) {
    versions[name] = versionInc(versions[name]);
  }
  console.log(versions);
  fs.writeFile('./version.json', JSON.stringify(versions), console.log);
}

// Generate corresponding webpack configuration by build name.
manifests = manifests.filter(name => name in manifestList);
let webpackConfig = manifests.map((manifest) => {
  let outputPath = "dist/" + manifest;
  rimraf(outputPath, console.error);

  // List of files to be copied.
  let copyPatterns = [
    {from: `./src/manifests/manifest_${manifest}.json`, to: "./manifest.json", transform(content) {
      let data = JSON.parse(content);
      if (mode == 'production') {
        delete data['key'];
        data['version'] = versions[manifest];
      }
      return JSON.stringify(data);
    }},
    {from: "./src/asset", to: "."},
  ]

  // webpack.DefinePlugin parameter.
  // Global constants configured at compile time.
  let defineObj = {
    "process.env.DECODER": false,
    "process.env.MAIN": false,
    "process.env.IME": JSON.stringify(false),
    "process.env.MV3": false,
    "ENVIRONMENT_IS_NODE": false,

    // For decoder package.
    "process.env.WASM": false,
    "process.env.JS": false,
    "process.env.ONLINE": false,
    "process.env.ALL": false,
    "process.env.IMEUIID": JSON.stringify(mode === "development" 
      ? DEV_UI_ID 
      : "enmcjlgogceppnhfkaimbjlcmcnmihbo")
  };
  if (decoder.indexOf("all") >= 0) {
    defineObj["process.env.ALL"] = true;
  } else {
    decoder.forEach(name => {
      switch(name) {
        case "wasm":
          defineObj["process.env.WASM"] = true;
          break;
        case "js":
          defineObj["process.env.JS"] = true;
          break;
        case "online":
          defineObj["process.env.ONLINE"] = true;
          break;
        default:
      }
    })
  }
  let copyDecoder = { from: "./libGooglePinyin/decoder.wasm", to: "." };
  switch(manifest) {
    case "v3":
      defineObj['process.env.MV3'] = true;
    case "v2":
      defineObj['process.env.MAIN'] = true;
      copyPatterns.push(copyDecoder);
      break;
    case "decoder":
      defineObj['process.env.DECODER'] = true;
      copyPatterns.push(copyDecoder);
      break;
    case "ime":
      defineObj["process.env.IME"] = JSON.stringify(true);
    default:
      defineObj["process.env.MAIN"] = true;

  }

  // Webpack Configuration.
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
    devtool: mode == 'development' ? "source-map" : false,
    resolve: {
      extensions: [".ts", "..."],
      alias: {
        src: path.resolve(process.cwd(), 'src')
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
      new CopyWebpackPlugin({
        patterns: copyPatterns
      }),
      new webpack.DefinePlugin(defineObj)
    ]
  }
});
if (webpackConfig.length == 1) {
  webpackConfig = webpackConfig[0]
}

module.exports = webpackConfig;