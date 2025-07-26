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
    const projectName = vscode.workspace.name || path.basename(folderPath);
    const languageId = document.languageId;

    const selectedText = document.getText(selection);

    // Get context lines (3 above and 3 below)
    const startLine = Math.max(0, selection.start.line - 3);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 3);

    let contextText = "";
    for (let i = startLine; i <= endLine; i++) {
      contextText += document.lineAt(i).text + "\n";
    }

    // Format text
    const customText = `📌 Code snippet from VS Code

🔹 Project: ${projectName}
🔹 Folder: ${folderPath}
🔹 File: ${fileName}
🔹 Lines: ${selection.start.line + 1}-${selection.end.line + 1}

📝 Selected code:
\`\`\`${languageId}
${selectedText}
\`\`\`

📚 Context:
\`\`\`${languageId}
${contextText.trimEnd()}
\`\`\`


`;

    await vscode.env.clipboard.writeText(customText);
    vscode.window.showInformationMessage("📋 Copied formatted code to clipboard!");
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
