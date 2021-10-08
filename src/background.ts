import { Controller } from "./controller";
// import type { InputToolCode, StateID } from "./model/enums";


let serverWorker: any = this;
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
      console.log('onActivate', engineID);
      serverWorker['engineID'] = engineID;
      // this._controller.activate(engineID as InputToolCode);
    })

    chrome.input.ime.onDeactivated.addListener(() => {
      // this._controller.deactivate();
      console.log('deactivate');
    });
  
    chrome.input.ime.onFocus.addListener((context) => {
      // this._controller.register(context);
      console.log('onFocus', context);
      serverWorker['context'] = context;
    });
  
    chrome.input.ime.onBlur.addListener((contextID) => {
      // this._controller.unregister();
      console.log('onBlur', contextID);

    });

    chrome.input.ime.onReset.addListener((engineID) => {
      // this._controller.reset();
      console.log('onReset', engineID)
    });


    (chrome.input.ime.onKeyEvent as any).addListener((engineID: string, keyEvent: KeyboardEvent, requestId: string) => {
      // return this._controller.handleEvent({
      //   keyEvent,
      //   requestId
      // });

      console.log('onKeyEvent', engineID, keyEvent, requestId);
      return false;
    });


    chrome.input.ime.onCandidateClicked.addListener((
    engineID, candidateID, button) => {
      // this._controller.processNumberKey({'key': candidateID + 1});
      console.log('onCandidateClicked', engineID, candidateID, button);
    });

    chrome.input.ime.onMenuItemActivated.addListener((
      engineID, name) => {
      // this._controller.switchInputToolState(stateID as StateID);
      console.log('onMenuItemActivated', engineID, name);
    });

    chrome.input.ime.onAssistiveWindowButtonClicked.addListener((details) => {
      console.log('onAsstistiveWindowButtonClicked', details);
    })

    chrome.input.ime.onInputContextUpdate.addListener((context) => {
      console.log('onInputContextUpdate', context);
    })

    chrome.input.ime.onSurroundingTextChanged.addListener((engineID, surroundingInfo) => {
      console.log('onSurroundingTextChanged', engineID, surroundingInfo);
    })


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