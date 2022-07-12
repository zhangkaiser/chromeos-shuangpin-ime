/**
 * Defines the model configs.
 */

import { Config } from "./config";
import { InputToolCode } from "./enums";
import { PinyinConfig } from "./pinyinconfig";
import { ShuangpinConfig } from "./shuangpinconfig";

/**
 * The input mothod config factory.
 */
export default class ConfigFactory {
  /** The current input tool code.  */
  private _inputToolCode?: InputToolCode = InputToolCode.WASM_PINYIN;

  /** The map of input tool code to config object. */
  private _map: Partial<Record<InputToolCode, Config>> = {};
  /**
   * Sets the current input tool by the given input tool code.
   */
  setInputTool(inputToolCode: InputToolCode) {
    this._inputToolCode = inputToolCode;
    this.#buildConfig(inputToolCode)
  }

  clearInputTool() {
    this._inputToolCode = undefined;
  }

  getInputTool() {
    return this._inputToolCode!;
  }

  /**
   * Gets the config for a given input tool code.
   */
  getConfig(inputToolCode: InputToolCode) {
    return this._map[inputToolCode] 
      ?? this.#buildConfig(inputToolCode);
  }

  /**
   * @todo
   * Gets the config for the current input tool.
   */
  getCurrentConfig() {
    return this._map[this._inputToolCode!]!;
  }

  /** Build configs. */
  #buildConfig(inputToolCode: InputToolCode) {
    switch (inputToolCode) {
      case InputToolCode.JS_SHUANGPIN:
      case InputToolCode.WASM_SHUANGPIN:

        return this._map[inputToolCode] = new ShuangpinConfig();

      case InputToolCode.WASM_PINYIN:
      case InputToolCode.JS_PINYIN:
      default:
        return this._map[inputToolCode] = new PinyinConfig();
    }
  }
}

export const configFactoryInstance = new ConfigFactory();