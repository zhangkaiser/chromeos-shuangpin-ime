
import { View } from "./view";
import { Model } from "./model/model";
import * as vscode from "vscode";
import { vscodeConfigFactory } from "./model/vsconfig";

View.prototype.updateInputTool = function(hidden) {
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
}