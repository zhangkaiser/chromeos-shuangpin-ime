

/**
 * Default forward permission for dispatcher.
 * 
 */
export const defaultDispatchForwardPromission = {
  /** : [needPermission, needWaitForReturn] */
  blur: [false, false],
  focus: [false, false],
  keyEvent: [false, true],
  menuItemActivated: [false, true],
  surroundingTextChanged: [true, true]
}


export class IMEEventDispatcher {
  constructor() {

  }

  registerEventDispatcher() {

  }

}