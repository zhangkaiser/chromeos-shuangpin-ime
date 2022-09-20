
import { View } from "./view";
import * as vscode from "vscode";
import { VscodeConfig, vscodeConfigFactory } from "./model/vsconfig";

View.prototype.updateInputTool = function(hidden) {
  console.log("hello");
  if (hidden) {
    vscode.commands.executeCommand("setContext", "vscode-ime.enabled", true);
  } else {
    vscode.commands.executeCommand("setContext", "vscode-ime.enabled", false);
  }
  this.updateMenuItems();
}

View.prototype.updateMenuItems = function(stateId) {
  vscode.window.setStatusBarMessage(`(${vscodeConfigFactory.getEngineID}) ime`);
}

View.prototype.refresh = function() {
  let segments = this.model.segments;
  vscode.languages.registerCompletionItemProvider("*", {
    provideCompletionItems: (document, position, token) => {
      let items = [];
      for (let i = 0; i < 5; i++) {
        let item = new vscode.CompletionItem(`1 ${segments.join()}`, vscode.CompletionItemKind.Text);
        item.insertText = segments.join();
        item.sortText = "" + i;
        item.detail = "Hello Test";
        items.push(item);
      }

      return new vscode.CompletionList(items, true);
    }
  })
}