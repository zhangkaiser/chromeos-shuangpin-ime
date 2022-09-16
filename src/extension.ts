/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("Congraulations, your extension is now active!");
  const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    vscode.window.showInformationMessage("Hello World from testing.");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {

}