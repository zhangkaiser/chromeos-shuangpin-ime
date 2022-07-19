/**
 * Defines the EventType, key event value, model status.
 */

import { InputToolCode, MessageType } from "./enums";

export interface IMessage {
  type: MessageType,
  data: any,
  inputToolCode: InputToolCode
  time: number
}
