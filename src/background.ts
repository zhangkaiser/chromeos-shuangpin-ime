import { Controller } from "./controller";
import { configFactoryInstance } from "./model/configfactory";
import { EventType, InputToolCode, StateID } from "./model/enums";
import { enableDebug } from "./utils/debug";
import { loadDict } from "./utils/transform";

enableDebug();
/**
 * The background class implements the script for the background page of chrome
 * os extension for os input tools.
 */
export class Background {
  /**
   * The controller for chrome os extension.
   */
  _controller = new Controller();
  configFactory = configFactoryInstance;

  constructor() {
    // Sets up a listener which talks to the option page.
    chrome.runtime.onMessage.addListener(this.processRequest.bind(this));
    
    this.#init();
    this._controller.addEventListener(EventType.UPDATESTATE, this.#updateStateToStorage.bind(this))
  }

  #updateStateToStorage() {
    // console.log('update the config to storage', this._controller.localConfig);
    chrome.storage.sync.set({
      config: this._controller.localConfig
    })
  }

  /** Initializes the background scripts. */
  #init() {
   
    chrome.runtime.onInstalled.addListener((res) => {

      if (res.reason === 'install') {
        // The default input tool configure.
        this.#updateStateToStorage();
      }
    })

    chrome.input.ime.onActivate.addListener((engineID) => {
      this._controller.activate(engineID as InputToolCode);
    })

    chrome.input.ime.onDeactivated.addListener(() => {
      this._controller.deactivate();
    });
  
    chrome.input.ime.onFocus.addListener((context) => {
      chrome.storage.sync.get('config', (res) => {
        if (res && res['config']) {
          let currentConfig = this.configFactory.getCurrentConfig();
          currentConfig!.setSolution(res['config']['solution']);
          currentConfig!.states[StateID.SBC].value = res['config']?.chos_init_sbc_selection;
          currentConfig!.states[StateID.PUNC].value = res['config']?.chos_init_punc_selection;
          currentConfig!.vertical = res['config']?.chos_init_vertical_selection ?? false;
          currentConfig!.traditional = res['config']?.chos_init_enable_traditional ?? false;
          if (currentConfig!.traditional) {
            loadDict();
          }
          this._controller.localConfig = res['config'];
        }
      })
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
  }

  /**
   * Updates settings from local storage.
   * @TODO
   */
  #updateSettingsFromLocalStorage(opt_inputToolCode?: string) {
    
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