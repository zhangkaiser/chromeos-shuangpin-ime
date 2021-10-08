
export class InputImeMethod implements IViewInputMethod {
  
  _menus?: chrome.input.ime.ImeParameters;

  set candidates(
    parameters: chrome.input.ime.CandidatesParameters
  ) {
    chrome.input.ime.setCandidates(parameters);
  }

  set menuItems(
    parameters: chrome.input.ime.ImeParameters | chrome.input.ime.MenuItemParameters
  ) {
    if (this._menus) {
      chrome.input.ime.updateMenuItems(parameters as chrome.input.ime.MenuItemParameters);
    }
    this._menus = parameters as chrome.input.ime.ImeParameters;
    chrome.input.ime.setMenuItems(parameters as chrome.input.ime.ImeParameters);
  }

  set composition(
    parameters: chrome.input.ime.CompositionParameters
  ) {
      if (!parameters.text) {
        chrome.input.ime.clearComposition(parameters);
      }
      chrome.input.ime.setComposition(parameters)
  }

  set cursorPosition(
    parameters: chrome.input.ime.CursorPositionParameters
  ) {
    chrome.input.ime.setCursorPosition(parameters)
  }

  set assistiveWindowProperties(parameters: {
    contextID: number;
    properties: chrome.input.ime.AssistiveWindowProperties;
  }) {
    chrome.input.ime.setAssistiveWindowProperties(parameters)
  }

  set assistiveWindowButtonHighlighted(parameters: { 
    contextID: number; 
    buttonID: chrome.input.ime.AssistiveWindowButton; 
    windowType: "undo"; 
    announceString?: string | undefined; 
    highlighted: boolean; }
  ) {
    chrome.input.ime.setAssistiveWindowButtonHighlighted(parameters)
  }

  set deleteSurroundingText(
    parameters: chrome.input.ime.DeleteSurroundingTextParameters
  ) {
    chrome.input.ime.deleteSurroundingText(parameters)
  }

  /**
   * Hides the input view window, which is popped up automatically by system.
   * If the input view window is already hidden, this function will do nothing. 
   */
  set hideInputView(isHide: boolean) {
    if (isHide) {
      chrome.input.ime.hideInputView()
    }
  }
  
  set keyEventHandled(parameters: {
    requestId: string,
    response: boolean
  }) {
    chrome.input.ime.keyEventHandled(parameters.requestId, parameters.response);
  }

  set sendKeyEvents(parameters: chrome.input.ime.SendKeyEventParameters) {
    chrome.input.ime.sendKeyEvents(parameters);
  }


  [Symbol.toStringTag]() {
    return 'ViewMethod';
  }
}