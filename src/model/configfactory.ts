/**
 * Defines the model configs.
 */

import { Config } from "./config";
import { InputToolCode } from "./enums";
import { PinyinConfig } from "./pinyinconfig";


/**
 * The input mothod config factory.
 */
export default class ConfigFactory {
  /** The current input tool code.  */
  private _inputToolCode: string = '';

  /** The map of input tool code to config object. */
  private _map:Record<string, Config> = {};

  /** The default config. */
  private _defaultConfig?: Config;



  /**
   * Sets the current input tool by the given input tool code.
   */
  setInputTool(inputToolCode: string) {
    this._inputToolCode = inputToolCode;
  }

  getInputTool() {
    return this._inputToolCode;
  }

  /**
   * Gets the config for a given input tool code.
   */
  getConfig(inputToolCode: string) {
    if (!this._map) {
      this.#buildConfigs(); 
    }
    if (this._map[inputToolCode]) {
      return this._map[inputToolCode];
    }
    return ;
  }

  /**
   * Gets the config for the current input tool.
   */
  getCurrentConfig() {
    if (!this._map) {
      this.#buildConfigs();
    }

    let code = this._inputToolCode;
    if (code && this._map[code]) {
      return this._map[code];
    }

    if (!this._defaultConfig) {
      this._defaultConfig = new Config()
    }

    return this._defaultConfig;
  }

  /** Builds input method configs. */
  #buildConfigs() {
    let code = InputToolCode;

    let pinyinConfig = new PinyinConfig();
    this._map[code.PINYIN_SIMPLIFIED] = pinyinConfig;
  }
}

export const configFactoryInstance = new ConfigFactory();