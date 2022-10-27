import { EventType } from "src/model/enums";

export function mockDownKey(key: string, shiftKey: boolean = false)
  : chrome.input.ime.KeyboardEvent 
{
  return {
    type: EventType.KEYDOWN,
    key,
    code: key,
    ctrlKey: false,
    altKey: false,
    shiftKey
  }
}