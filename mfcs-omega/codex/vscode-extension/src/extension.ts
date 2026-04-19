import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'mfcsOmega.openCodex',
    () => {
      vscode.window.showInformationMessage('MFCS–OMEGA Codex opened.');
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
