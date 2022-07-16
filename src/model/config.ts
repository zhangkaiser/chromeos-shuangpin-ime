/**
 * @fileoverview Defines the model configs.
 */

import { KeyboardLayouts } from "./enums";
import type { State } from "./state";
import type { StateID} from "./enums";

export interface IConfig {
  states: Record<StateID, State>;
}

/**
 * The input method config.
 */
export abstract class Config {
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

  /** Whethe enable the shuangpin ime. */
  enabelShuangpin = false;
  
  /** The shuangpin solution. */
  shuangpinSolution = 'pinyinjiajia';

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

  /** Return the translated word. */
  getTransform(c: string): string | string[] {
    return c;
  }

  revert(segment: string, source: string) {
    return {
      deletedChar: segment.slice(-1),
      segment: segment.slice(0, -1),
      source: source.slice(0, -1)
    }
  }

  setSolution(text: string) { }
}