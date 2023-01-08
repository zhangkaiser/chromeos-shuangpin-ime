import type { Config } from "./config";
import { InputToolCode, Key, Modifier, PinyinStateID, OnlineEngine, ShuangpinStateID, StateID, KeyboardLayouts } from "./enums";

export class State {
  constructor(
    /** The description of the state. */ public desc: string = '',
    /** The shortcut of the state. */ public shortcut: [string, Modifier] | [Modifier] | any[] = []
  ) { }
}

export interface ILocalStorageOfGlobalState {
  inputToolCode: InputToolCode
}

export class IMEState {

  lang = true;
  sbc = false;
  punc = true;
  traditional = false;
  predictor = true;
  vertical = true;

  /** The select keys. */
  selectKeys = '1234567890';
  
  shuangpinSolution = "pinyinjiajia_o";

  /** The  fuzzy expansion paris. */
  fuzzyExpansions: string[] = [];

  /** The punctuationReg. */
  punctuationReg = ["[^a-z0-9 \r]", ""]
  
  /** The regexp for editor chars. */
  editorCharReg = ["[a-z]", ""];

  /** The pageup chars. */
  pageupCharReg = ["xyz", "g"];

  /** The pagedown chars. */
  pagedownCharReg = ["xyz", "g"]; 

  /** The page size. */
  pageSize = 5;

  /** The maximum allowed input length. */
  maxInputLen = 40;

  /** The request number. */
  requestNum = 50;

  /** Whether automatically highlight the fetched candidates. */
  autoHighlight = true;
  
  /** The keyboard layout. */
  layout = KeyboardLayouts.STANDARD;
}


export type IIMEState = InstanceType<typeof IMEState>;
export type IIMEStateKeyUnion = keyof IIMEState;

export interface ILocalStorageDataModel {
  states?: IIMEState,
  global_state?: ILocalStorageOfGlobalState
}