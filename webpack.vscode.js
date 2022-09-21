const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const extMark = "vscode-ime";
const extEditName = "vscode ime";

const letters =  "abcdefghijklmnopqrstuvwxyz";
const punctuations = "`-=[]\\;',./";
const numbers = "1234567890";
const specials = ['enter', 'space', 'backspace']; 

const whenCauseMap = {
  enabled: `editorTextFocus && ${extMark}.enabled`,
  englishPunc: `editorTextFocus && ${extMark}.enabled && !${extMark}.state.punc`,
  inited: `editorTextFocus && ${extMark}.enabled && ${extMark}.inited`
}

// format = [id, type, default, markdownDescription, ...otherArgs:{name: value}],
const configProperties = [
  [`${extMark}.engine.id`, "string", "zh-wasm-shuangpin", "IME EngineID Name", 
    {
      enum: ["zh-wasm-shuangpin", "zh-wasm-pinyin"],
      enumDescriptions: [
        "Chinese shuangpin IME",
        "Chinese pinyin IME"
      ]
    }
  ],
  // [`${extMark}.chineseConfig.state.sbc`, ]
]

function registerKeybindings(data) {
  data['contributes']['keybindings'] = [
    ...letters.split("").map((letter) => ({ // KeyA-Z.
      command: `${extMark}.key${letter.toUpperCase()}`,
      key: letter,
      when: whenCauseMap.enabled 
    })),

    ...punctuations.split("").map((punc) => ({
      command: `${extMark}.key${punc}`,
      key: punc,
      when: whenCauseMap.punc
    })),
    ...(punctuations + numbers).split("").map((punc) => ({
      command: `${extMark}.shift${punc}`,
      key: `shift+${punc}`,
      when: whenCauseMap.punc
    })),

    ...numbers.split("").map((num) => ({
      command: `${extMark}.key${num}`,
      key: "" + num,
      when: whenCauseMap.enabled
    })),

    ...specials.map((spec) => ({
      command: `${extMark}.special${spec}`,
      key: spec,
      when: whenCauseMap.inited
    })),

    ...data['contributes']['keybindings']
  ]
}

function registerConfiguration(data) {

  let configuration = data['contributes']['configuration'];
  
  configuration = {
    title: extEditName,
    properties: {
      ...Object.fromEntries(configProperties.map((prop) => ([
        prop[0],
        {
          type: prop[1],
          default: prop[2],
          markdownDescription: prop[3],
          ...prop[4] ?? {}
        }
      ]))),
      ...configuration['properties']
    } 
  }
}

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
        {
          from: "./src/manifests/vscode.json", 
          to: "./package.json", 
          transform(context) {
            let data = JSON.parse(context);
            
            registerKeybindings(data);
            registerConfiguration(data);

            return JSON.stringify(data);

          }

        },
        {from: "./libGooglePinyin/decoder.wasm", to: "./decoder.wasm"},
        {from: "./libGooglePinyin/decoder.js", to: "./decoder.js"}
      ]
    }),
    new webpack.DefinePlugin({
      "process.env.ALL": true
    })
  ]
}