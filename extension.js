const vscode = require("vscode");
const path = require("path");

function activate(context) {
  const disposable = vscode.commands.registerCommand("extension.copyForAI", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const selection = editor.selection;

    const filePath = document.uri.fsPath;
    const folderPath = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath || path.dirname(filePath);
    const fileName = path.basename(filePath);
    // const projectName = vscode.workspace.name || path.basename(folderPath);
    // const languageId = document.languageId;

    const selectedText = document.getText(selection);

    const config = vscode.workspace.getConfiguration("copyforai");
    const includeContext = config.get("includeContext", true);

    // Get context lines
    const startLine = Math.max(0, selection.start.line - 2);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 2);

    const aboveLines = [];
    for (let i = startLine; i < selection.start.line; i++) {
      aboveLines.push(document.lineAt(i).text);
    }

    const belowLines = [];
    for (let i = selection.end.line + 1; i <= endLine; i++) {
      belowLines.push(document.lineAt(i).text);
    }

    // Format text
    let customText = `📋 Code snippet copied from ${folderPath}\\${fileName} (lines ${selection.start.line + 1}-${selection.end.line + 1})\n\n`
    if (includeContext && aboveLines.length) {
      customText += `**Above context:**\n\`\`\`\n...\n${aboveLines.join("\n")}\n\`\`\`\n\n`;
    }
    if (includeContext) {
      customText += `**📋 Selected code:**\n`;
    }
    customText += `\`\`\`\n${selectedText}\n\`\`\`\n\n`;
    if (includeContext && belowLines.length) {
      customText += `**Below context:**\n\`\`\`\n${belowLines.join("\n")}\n...\n\`\`\`\n`;
    }
    customText += `---\n\n`;

    await vscode.env.clipboard.writeText(customText);
    vscode.window.showInformationMessage("📋 Copied formatted code to clipboard!");
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = { activate, deactivate };
