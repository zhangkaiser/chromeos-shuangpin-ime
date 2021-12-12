import { OnlineEngine } from "../decoder/enums";

export class State {
  /** The shortcut of the state. */
  shortcut: string[] = [];

  /** The description of the state. */
  desc = '';

  /** The value of the state. */
  value:boolean = false;
}


export class OnlineState {

  /** Online decoder status. */
  static onlineStatus: boolean = true;

  /** Online decoder engine. */
  static onlineEngine: OnlineEngine = 0;
}
