import { OnlineEngine } from "../decoder/enums";
import type { Config } from "./config";
import { Key, Modifier, StateID } from "./enums";

export class State {
  constructor(
    /** The description of the state. */ public desc: string = '',
    /** The value of the state. */ public value: boolean = false,
    /** The shortcut of the state. */ public shortcut: [string, Modifier] | [Modifier] | any[] = []
  ) { }
}


export class OnlineState {

  /** Online decoder status. */
  static onlineStatus: boolean = true;

  /** Online decoder engine. */
  static onlineEngine: OnlineEngine = 0;
}


/**
 * @todo
 */
 export interface IEngineState {

}

/** Used to improve and perfect `inactivate` bug(used to improve and perfect 'inactivate' bug(version 3 for manifest))  */
export interface IShuangpinState {

}

export interface IIMEState {
  lang: boolean
  punc: boolean,
  sbc: boolean,
  enableVertical: boolean,
  enableTraditional: boolean,
  shuangpinSolution: string,
  enableOnline: boolean,
  onlineEngine: number
}

export interface IMessageDataOfUpdateState {
  state: keyof IIMEState,
  value: any
}

const stateKeyList = [StateID.LANG, StateID.SBC, StateID.PUNC];

export function getStates(config: Config) {
  let stateEntries = stateKeyList.map(
    (state) => [state, config.states[state].value]
  );
  let configEntries = ['enableVertical', 'enableTraditional', 'shuangpinSolution']
    .map((prop) => [prop, config[prop as keyof Config]]);

  return Object.fromEntries([...stateEntries, ...configEntries]);
}

export function setStates(config: Config, states: Partial<IIMEState>) {
  for (const [key, value] of Object.entries(states)) {
    if (stateKeyList.indexOf(key as StateID) > -1) {
      config.states[key as StateID].value = value as boolean;
    } else {
      (config as any)[key] = value;
    }
  }
}