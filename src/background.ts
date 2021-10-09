import { Controller } from "./controller";
import type { InputToolCode, StateID } from "./model/enums";

/**
 * The background class implements the script for the background page of chrome
 * os extension for os input tools.
 */
export class Background {
  /**
   * The controller for chrome os extension.
   */
  _controller = new Controller();

  constructor() {
    // Sets up a listener which talks to the option page.
    chrome.runtime.onMessage.addListener(this.processRequest.bind(this));
    
    this.#init();
  }

  /** Initializes the background scripts. */
  #init() {
    this.#updateSettingsFromLocalStorage();

    chrome.input.ime.onActivate.addListener((engineID) => {
      this._controller.activate(engineID as InputToolCode);
    })

    chrome.input.ime.onDeactivated.addListener(() => {
      this._controller.deactivate();
    });
  
    chrome.input.ime.onFocus.addListener((context) => {
      this._controller.register(context);
    });
  
    chrome.input.ime.onBlur.addListener((/** contextID */) => {
      this._controller.unregister();
    });

    chrome.input.ime.onReset.addListener((/** engineID */) => {
      this._controller.reset();
    })


    chrome.input.ime.onKeyEvent.addListener((_, keyEvent) => {
      return this._controller.handleEvent(keyEvent);
    });


    chrome.input.ime.onCandidateClicked.addListener((
    _, candidateID, __) => {
      this._controller.processNumberKey({'key': candidateID + 1});
    });

    chrome.input.ime.onMenuItemActivated.addListener((
      _, stateID) => {
        this._controller.switchInputToolState(stateID as StateID);
    });

    if ((chrome as any).inputMethodPrivate && (chrome as any).inputMethodPrivate.startIme) {
      (chrome as any).inputMethodPrivate.startIme();
    }
  }

  /**
   * Updates settings from local storage.
   * @TODO
   */
  #updateSettingsFromLocalStorage(opt_inputToolCode?: string) {
    if (opt_inputToolCode) {
      chrome.storage.local.get(opt_inputToolCode, (res) => {
        console.log(res)
        // this._controller.
      })
    }
  }

  /**
   * Processes incoming requests from option page.
   */
  processRequest(request: any) {
    if (request['update']) {
      this.#updateSettingsFromLocalStorage(request['update']);
    }
  }
}

new Background();