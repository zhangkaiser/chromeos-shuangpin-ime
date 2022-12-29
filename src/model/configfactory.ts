/**
 * Defines the model configs.
 */

import { Config } from "./config";
import { GlobalState, InputToolCode } from "./enums";
import { PinyinConfig } from "./pinyinconfig";
import { ShuangpinConfig } from "./shuangpinconfig";
import { ILocalStorageOfGlobalState } from "./state";

/**
 * The input mothod config factory.
 */
export default class ConfigFactory {

  private _configs: Record<InputToolCode, Config>;
  constructor() {
    let shuangpinConfigInstance = new ShuangpinConfig();
    let pinyinConfigInstance = new PinyinConfig();

    this._configs = {
      [InputToolCode.JS_PINYIN]: pinyinConfigInstance,
      [InputToolCode.JS_SHUANGPIN]: shuangpinConfigInstance,
      [InputToolCode.WASM_PINYIN]: pinyinConfigInstance,
      [InputToolCode.WASM_SHUANGPIN]: shuangpinConfigInstance
    }
  }

  _globalState: ILocalStorageOfGlobalState = {
    inputToolCode: InputToolCode.WASM_SHUANGPIN,
  }

  set globalState(value: ILocalStorageOfGlobalState) {
    if (value && value.inputToolCode) {
      this._globalState = value;
    }
  }

  get globalState() {
    return this._globalState;
  }

  /**
   * Sets the current input tool by the given input tool code.
   */
  setInputTool(inputToolCode: InputToolCode) {
    this.globalState.inputToolCode = inputToolCode;
  }

  clearInputTool() {
    this.globalState.inputToolCode = InputToolCode.WASM_SHUANGPIN;
  }

  getInputTool() {
    return this.globalState.inputToolCode;
  }

  /**
   * Gets the config for a given input tool code.
   */
  getConfig(inputToolCode: InputToolCode) {
    return this._configs[inputToolCode]!;
  }

  /**
   * Gets the config for the current input tool.
   */
  getCurrentConfig() {
    return this._configs[this.globalState.inputToolCode];
  }

}

export const configFactoryInstance = new ConfigFactory();