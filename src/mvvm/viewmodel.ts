import { InputImeModel } from "./model";
import { InputImeMethod } from './view';



export class ViewModel extends EventTarget implements IViewModel {
  [index: string]: any;
  engineID?: string;
  _context?: chrome.input.ime.InputContext;

  constructor() {
    super();
  }

  data:any = new InputImeMethod();

  model?:InputImeModel;

  setData(newData: IViewInputMethod, isRender: boolean = true) {
    
    for (let name in newData) {
      let key = name as keyof IViewInputMethod;
      this[name] = newData[key];
      if (isRender) {
        this.data[key] = newData[key];
      }
    }
  }

  onActivate(engineID: string) {
    this.engineID = engineID;
    this.model = new InputImeModel(
      engineID, 
      this.setData.bind(this),
      this
      );
    this.model.setMenus();
  }

  onDeactivated() {
    this.model = undefined;
    this.setData({
      hideInputView: true
    });
  }

  onFocus(context: chrome.input.ime.InputContext) {
    this._context = context;
    if (this.model) {
      this.model.context = context;
      this.model.clear();
    }
  }

  onAssistiveWindowButtonClicked(
    details: chrome.input.ime.AssistiveWindowButtonClickedDetails) {
  }

  onBlur() {
    this._context = undefined;
    this.model?.clear();
  }

  onReset() {
    this.model?.abort();
  }

  onKeyEvent(engineID: string, keyEvent: KeyboardEvent, requestId: string) {
    if (!this.model) {
      this.model = new InputImeModel(
        engineID, 
        this.setData.bind(this),
        this
      );
    }

    if (!this._context) {
      return false;
    }

    // Handle shortcut/action key.
    return this.handleKeyEvent(keyEvent, requestId);
  }

  onMenuItemActivated() {

  }

  onInputContextUpdate() {

  }

  onSurroundingTextChanged() {

  }

  onCandidateClicked(
    engineID: string,
    candidateID: number,
    button: MouseButton | string
  ) {

  }

  handleKeyEvent(keyEvent: KeyboardEvent, requestId: string) {
    return undefined;
  }


}