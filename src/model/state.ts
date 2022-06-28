import { OnlineEngine } from "../decoder/enums";
import { Modifier } from "./enums";

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
