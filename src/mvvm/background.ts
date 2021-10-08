import { ViewModel } from "./viewmodel";

class Background extends ViewModel {
  constructor() {
    super();
    /** Sets up some listeners */
    chrome.runtime.onMessage
      .addListener(this.messageHandler.bind(this));
    
    chrome.input.ime.onActivate
      .addListener(this.onActivate.bind(this));
    chrome.input.ime.onDeactivated
      .addListener(this.onDeactivated.bind(this));
    chrome.input.ime.onFocus
      .addListener(this.onFocus.bind(this));
    chrome.input.ime.onBlur
      .addListener(this.onBlur.bind(this));
    chrome.input.ime.onReset
      .addListener(this.onReset.bind(this));
    (chrome.input.ime.onKeyEvent as any)
      .addListener(this.onKeyEvent.bind(this));
    chrome.input.ime.onCandidateClicked
      .addListener(this.onCandidateClicked.bind(this));
    chrome.input.ime.onInputContextUpdate
      .addListener(this.onInputContextUpdate.bind(this));
    chrome.input.ime.onSurroundingTextChanged
      .addListener(this.onSurroundingTextChanged.bind(this));
    chrome.input.ime.onMenuItemActivated
      .addListener(this.onMenuItemActivated.bind(this));
    chrome.input.ime.onAssistiveWindowButtonClicked
      .addListener(this.onMenuItemActivated.bind(this));
  }

  messageHandler(
    msg: any, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: any) => void) {

  }
}

new Background()