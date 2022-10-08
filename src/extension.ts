/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { IMEBackground } from "src/backgrounds/vscode";


export function activate(context: vscode.ExtensionContext) {
  const ime = new IMEBackground(context);
}

export function deactivate() {
  
}
