import type { Config } from "./config";
import { Key, Modifier, PinyinStateID, PredictEngine, ShuangpinStateID, StateID } from "./enums";

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

export interface IGlobalState {
  connectExtId: string
}

export type IIMEState = IPinyinState | IShuangpinState;

export interface IInitedState {
  states?: IIMEState,
  globalState?: IGlobalState
}