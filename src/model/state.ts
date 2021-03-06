import type { Config } from "./config";
import { Key, Modifier, StateID } from "./enums";

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

/** Used to improve and perfect `inactivate` bug(used to improve and perfect 'inactivate' bug(version 3 for manifest))  */
export interface IShuangpinState {

}
