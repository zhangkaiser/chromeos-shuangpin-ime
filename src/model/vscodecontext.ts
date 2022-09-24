import * as vscode from "vscode";


const StateMap = {
  enabled: "vscode-ime.enabled",
  punc: "vscode-ime.state.punc",
  inited: "vscode-ime.inited"
}
export class VscodeContextState {

  setContext(stateName: string, value: boolean) {
    vscode.commands.executeCommand("setContext", stateName, value);
  }

  imeEnabled(value: boolean = true) {
    this.setContext(StateMap.enabled, value);
  }

  imePunc(value: boolean = true) {
    this.setContext(StateMap.punc, value);
  }

  imeInited(value: boolean = true) {
    this.setContext(StateMap.punc, value);
  }

}