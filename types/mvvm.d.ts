
interface IViewInputMethod {

  /**
   * Sets the current candidate list. 
   * This fails if this extension doesn't own the active IME
   */
  candidates?: chrome.input.ime.CandidatesParameters;

  /**
   * Adds the provided menu items or Updates the state of the MenuItems specified
   * to the language menu when this IME is active.
   */
  menuItems?: chrome.input.ime.ImeParameters | chrome.input.ime.MenuItemParameters;

  /**
   * Clear or Set the current composition. 
   * If this extension does not own the active IME, this fails.
   */
  composition?: chrome.input.ime.CompositionParameters;

  /**
   * Set the position of the cursor in the candidate window. This is a no-op if
   * this extension does not own the active IME.
   */
  cursorPosition?: chrome.input.ime.CursorPositionParameters;

  /**
   * Shows or Hides an assistive window with the given properties.
   */
  assistiveWindowProperties?: {
    contextID: number;
    properties: chrome.input.ime.AssistiveWindowProperties;
  };

  /**
   * Highlights/Unhighlights a button in an assistive window.
   */
  assistiveWindowButtonHighlighted?: {
    contextID: number; 
    buttonID: chrome.input.ime.AssistiveWindowButton; 
    windowType: "undo"; 
    announceString?: string | undefined; 
    highlighted: boolean; 
  }

  /**
   * Deletes the text around the caret.
   */
  deleteSurroundingText?: chrome.input.ime.DeleteSurroundingTextParameters

  /**
   * Hides the input view window, which is popped up automatically by system.
   * If the input view window is already hidden, this function will do nothing. 
   */
  hideInputView?: boolean;

  /**
   * Indicates that the key event received by onKeyEvent is handled. This should
   * only be called if the onKeyEvent listener is asynchronous.
   */
  keyEventHandled?: {
    requestId: string,
    response: boolean
  };

  /**
   * Sends the key events. This function is expected to be used by virtual 
   * keyboards. When key(s) on a virtual keyboard is pressed by a user, this
   * function is used to propagate that event to the system.
   */
  sendKeyEvents?: chrome.input.ime.SendKeyEventParameters;
}


interface IViewModel {

  /** ID of the engine receiving the event. */
  engineID?: string;

  /**
   * Event listener.This event is sent when an IME is activated.
   * It signals that the IME will be receiving onKeyPress events.
   */
  onActivate: (engineID: string) => void;
  
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
    button: MouseButton
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


interface IInputImeModel {

  /** Get the menuItems. */
  getMenus:() => chrome.input.ime.ImeParameters;


  /** Clear the current model data. */
  clear: () => void;

  /** Aborts the model, the behavior may be overridden by sub-classes.  */
  abort: () => void;
}

type MouseButton = 'left' | 'middle' | 'right'