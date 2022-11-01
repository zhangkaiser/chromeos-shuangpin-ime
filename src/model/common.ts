/**
 * Defines the EventType, key event value, model status.
 */

import { Decoders, InputToolCode, MessageType } from "./enums";

export interface IMessage {
  type: MessageType,
  data: any,
  inputToolCode?: InputToolCode
  time?: number
}



export interface IMessageDataOfUpdateState {
  state: string,
  value: any
}

export interface IMesageDataOfDecode {
  source: string,
  chooseId: number
}

export interface IMessageDataOfUserCommits {
  source: string, // pin'yin
  target: string // PY
}

export interface IMessageDataOfInstalled {

}