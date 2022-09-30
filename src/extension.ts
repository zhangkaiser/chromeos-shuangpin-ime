/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { adapter } from "src/imeadapterforvscode";
import { IMEBackground } from "src/backgrounds/vscode";

adapter();

export function activate(context: vscode.ExtensionContext) {
  const ime = new IMEBackground(context);

  // Trigger letters key event.
  ime.registerCompletionProvider();
  
  // ime.registerPredictionProvider();
}

export function deactivate() {
  
}
