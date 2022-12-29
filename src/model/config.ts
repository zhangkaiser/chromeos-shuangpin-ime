/**
 * @fileoverview Defines the model configs.
 */

import { InputToolCode, KeyboardLayouts, OnlineEngine } from "./enums";
import type { State } from "./state";
import { StateID} from "./enums";

export interface IConfig {
  states: Record<StateID, State>;
}

/**
 * The input method config.
 */
export abstract class Config {
  
  configStates: Record<string, boolean | Object> = {};

  /** The input tool states. */
  abstract states: Record<StateID, State>;

  /** The  fuzzy expansion paris. */
  fuzzyExpansions: string[] = [];

  /** The punctuationReg. */
  punctuationReg = /[^a-z0-9 \r]/i
  
  /** The regexp for editor chars. */
  editorCharReg = /[a-z]/i;

  /** The pageup chars. */
  pageupCharReg = /xyz/g;

  /** The pagedown chars. */
  pagedownCharReg = /xyz/g; 

  /** The page size. */
  pageSize = 5;

  /** The maximum allowed input length. */
  maxInputLen = 40;

  /** The request number. */
  requestNum = 50;

  /** Whether automatically highlight the fetched candidates. */
  autoHighlight = true;

  /** Whether enables the user dictionary. */
  enableUserDict = true;
  
  /** Whether enable the Chinese Traditional. */
  enableTraditional = false;

  /**
   * @todo
   * Virtual Keyboard support. 
   * Whethe enable virtual keyboard. */
  enabledVirtualKeyboard = false;

  /** The keyboard layout. */
  layout = KeyboardLayouts.STANDARD;

  /** The select keys. */
  selectKeys = '1234567890';
  get selectKeyReg() {
    return new RegExp(`[${this.selectKeys}]`);
  }

  /**
   * @deprecated
   * Whethe enable the shuangpin ime. */
  enabelShuangpin = false;
  
  /** The shuangpin solution. */
  shuangpinSolution = '';

  /** The predict engine. */
  OnlineEngine: OnlineEngine = OnlineEngine.BAIDU;

  
  /** Use vertical to show candidates. */
  enableVertical = false;

  /** Transform before the popup editor opened. */
  preTransform(_c: string) {
    return '';
  }

  /**
   * Transform when the popup editor opened.
   */
  transform(context: string, c: string, raw: string) {
    return c;
  }

  /**
   * Transform when the popup editor is going to close.
   */
  postTransform(c: string) {
    return c;
  }

  /**
   * Transform the character on the editor text.
   */
  transformView(text: string, rawStr?: string) {
    return text;
  }

  /** Return the translated target. */
  tranformCommit(text: string) {
    return text;
  }

  revert(segment: string, source: string) {
    return {
      deletedChar: segment.slice(-1),
      segment: segment.slice(0, -1),
      source: source.slice(0, -1)
    }
  }

  setSolution(text: string) { }

  getStates() {
    let states: any = {};
    for (let key in this.configStates) {
      if (typeof this.configStates[key] === "object") {
        let keyObj = (this as any)[key];
        let keys = Object.keys(this.configStates[key]);
        keys.forEach((item) => {
          states[item] = keyObj[item].value;
        });
      } else {
        states[key] = (this as any)[key];
      }
    }

    return states;
  }

  setStates(states: any) {
    let keys = Object.keys(states);
    keys.forEach((key) => {
      if (typeof this.configStates[key] !== "object") {
        (this as any)[key] = states[key];
      }
    })
  }
}