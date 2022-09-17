/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import Decoder  from "src/decoder/cdecoder";

export function activate(context: vscode.ExtensionContext) {
  console.log("Congraulations, your extension is now active!");
  let decoder = new Decoder('zh-wasm-shuangpin', 'pinyinjiajia_o');
  let a = decoder.decode("yidjyidi", -1);
  console.log(a);
  const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    vscode.window.showInformationMessage("Hello World from testing.");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {

}
