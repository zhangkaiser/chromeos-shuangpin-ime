
export const imeEventList = [
  "onActivate",
  "onAssistiveWindowButtonClicked",
  "onBlur",
  "onCandidateClicked",
  "onDeactivated",
  "onFocus",
  "onInputContextUpdate",
  "onKeyEvent",
  "onMenuItemActivated",
  "onReset",
  "onSurroundingTextChanged"
]

export type IIMEEventUnion = 
  "onActivate" | "onAssistiveWindowButtonClicked" | "onBlur" |
  "onCandidateClicked" | "onDeactivated" | "onFocus"| "onInputContextUpdate" | 
  "onReset" | "onSurroundingTextChanged" | "onKeyEvent" | "onMenuItemActivated";

export const imeMethodList = [
  "clearComposition",
  "commitText",
  "deleteSurroundingText",
  "hideInputView",
  "keyEventHandled",
  "sendKeyEvents",
  "setAssistiveWindowButtonHighlighted",
  "setAssistiveWindowProperties",
  "setCandidates",
  "setCandidateWindowProperties",
  "setComposition",
  "setCursorPosition",
  "setMenuItems",
  "updateMenuItems"
]

export type IIMEType = keyof typeof chrome.input.ime;
export type IIMEMethodUnion = Exclude<IIMEType, IIMEEventUnion>;

export type IMEMethodInterface = Omit<typeof chrome.input.ime, IIMEEventUnion>

export type IIMEController = Record<IIMEType, Function>;

export interface IMEControllerEventInterface {

  /**
   * Event listener.This event is sent when an IME is activated.
   * It signals that the IME will be receiving onKeyPress events.
   */
  onActivate: (engineID: string, screen: string) => void;
  
  /**
   * Event listener.
   * This event is send when focus leaves a text box. It is sent to all
   * extensions that are listening to this event, and enabled by the user.
   */
  onBlur: (contextID: number) => void;
  /**
   * onAssistiveWindowButtonClicked event listener.
   * This event is sent when a button in an assistive window is clicked.
   */
  onAssistiveWindowButtonClicked?: (
    details: chrome.input.ime.AssistiveWindowButtonClickedDetails
  ) => void;

  /**
   * Event listener. This event is sent if this extension owns the active IME.
   */
  onCandidateClicked:(
    engineID: string,
    candidateID: number,
    button: 'left' | 'middle' | 'right'
  ) => void;
  
  /**
   * Event listener.
   * This event is sent when an IME is deactivated. It signals that the IME will
   * no longer be receiving onKeyPress events.
   */
  onDeactivated: (engineID: string) => void;
  
  /**
   * Event listener.
   * This event is sent when focus enters a text box. It is sent to all 
   * extensions that are listening to this event, and enabled by the user.
   */
  onFocus: (context: chrome.input.ime.InputContext) => void;

  /**
   * Event listener.
   * This event is sent when the properties of the current InputContext change, 
   * such as the the type. It is sent to all extensions that are listening to 
   * this event, and enabled by the user.
   */
  onInputContextUpdate: (context: chrome.input.ime.InputContext) => void;

  /**
   * Fired when a key event is sent from the operating system. The event will be
   * sent to the extension if this extension owns the active IME. The listener 
   * function should return true if the event was handled false if it was not. 
   * If the event will be evaluated asynchronously, this function must return 
   * undefined and the IME must later call keyEventHandled() with the result.
   */
  onKeyEvent: (engineID: string, keyData: KeyboardEvent, requestId: string)
    => undefined | boolean;
  
  /**
   * Called when the user selects a menu item
   */
  onMenuItemActivated: (engineID: string, name: string) => void;

  /**
   * This event is sent when chrome terminates ongoing text input session.
   */
  onReset: (engineID: string) => void;
  
  /**
   * Called when the editable string around caret is changed or when the caret
   * position is moved. The text length is limited to 100 characters for each 
   * back and forth direction.
   */
  onSurroundingTextChanged: (engineID: string,
    surroundingInfo: chrome.input.ime.SurroundingTextInfo) => void;
}