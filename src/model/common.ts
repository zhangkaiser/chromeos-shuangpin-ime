/**
 * Defines the EventType, key event value, model status.
 */

import { MessageType } from "./enums";

export interface IMessage {
  type: MessageType,
  data: any,
  time: number
}
