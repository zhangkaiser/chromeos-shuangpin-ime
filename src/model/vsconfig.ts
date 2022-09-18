
import * as vscode from "vscode";
import { PinyinStateID, ShuangpinStateID, StateID } from "./enums";



type ConfigurationSection = 
  | "vscode-ime.engine.id"
  | "vscode-ime.chineseConfig.state.sbc"
  | "vscode-ime.chineseConfig.state.punc"
  | "vscode-ime.chineseConfig.state.traditional"
  | "vscode-ime.chineseConfig.state.predictor"
  | "vscode-ime.pinyinConfig.state.predictEngine"
  | "vscode-ime.shuangpinConfig.state.solution"

export class VscodeConfig {
  configuration = vscode.workspace.getConfiguration();

  getConfig<T>(section: ConfigurationSection, defaultValue: T) {
    return this.configuration.get(section, defaultValue);
  }

  getEngineID() {
    return this.getConfig("vscode-ime.engine.id", "zh-wasm-shuangpin");
  }

  getGlobalState() {
    return {
      [StateID.LANG]: true,
      [StateID.SBC]: this.getConfig("vscode-ime.chineseConfig.state.sbc", false),
      [StateID.PUNC]: this.getConfig("vscode-ime.chineseConfig.state.punc", true),
      [StateID.TRADITIONAL]: this.getConfig("vscode-ime.chineseConfig.state.traditional", false),
      [StateID.PREDICTOR]: this.getConfig("vscode-ime.chineseConfig.state.predictor", true),
      [PinyinStateID.PREDICT_ENGINE]: this.getConfig("vscode-ime.pinyinConfig.state.predictEngine", 0),
      [PinyinStateID.VERTICAL]: false,
      [ShuangpinStateID.SOLUTION]: this.getConfig("vscode-ime.shuangpinConfig.state.solution", "pinyinjiajia_o")
    }
  }

}