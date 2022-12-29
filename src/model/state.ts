import type { Config } from "./config";
import { InputToolCode, Key, Modifier, PinyinStateID, OnlineEngine, ShuangpinStateID, StateID } from "./enums";

export class State {
  constructor(
    /** The description of the state. */ public desc: string = '',
    /** The value of the state. */ public value: boolean = false,
    /** The shortcut of the state. */ public shortcut: [string, Modifier] | [Modifier] | any[] = []
  ) { }
}

/**
 * @todo
 */
 export interface IEngineState {

}

export type IPinyinConfigState = Record<PinyinStateID, boolean | any>;
export type IShuangpinConfigState = Record<ShuangpinStateID, any>;

export type IChineseState = Record<StateID, boolean>;

export interface IPinyinState extends IChineseState, IPinyinConfigState {

}

export interface IShuangpinState extends IPinyinState, IShuangpinConfigState {
}

export interface ILocalStorageOfGlobalState {
  inputToolCode: InputToolCode
}

export type IIMEState = IPinyinState | IShuangpinState;

export interface ILocalStorageDataModel {
  states?: IIMEState,
  global_state?: ILocalStorageOfGlobalState
}