/**
 * @fileoverview Defines the model configs.
 */

import { KeyboardLayouts, OnlineEngine } from "./enums";
import { IIMEState, IMEState, State } from "./state";
import { StateID} from "./enums";

/**
 * The global input method config.
 */
export abstract class Config {
 
  states = new IMEState();
  /** The input tool states. */
  abstract menuStates: Record<StateID, State>;


  getSelectKeyReg() {
    return new RegExp(`[${this.states.selectKeys}]`);
  }

  getPuncReg() {
    return new RegExp(this.states.punctuationReg[0], this.states.punctuationReg[1]);
  }

  getEditorCharReg() {
    return new RegExp(this.states.editorCharReg[0], this.states.editorCharReg[1]);
  }

  getPagedownCharReg() {
    return new RegExp(this.states.pagedownCharReg[0], this.states.pagedownCharReg[1]);
  }

  getPageupCharReg() {
    return new RegExp(this.states.pageupCharReg[0], this.states.pageupCharReg[1]);
  }

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

  setStates(states: Partial<IIMEState>) {
    for (let name in states) {
      (this.states as any)[name] = (states as any)[name];
    }
  }
}