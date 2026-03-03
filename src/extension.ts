import * as vscode from 'vscode';
import * as http from 'http';

let server: http.Server | undefined;
const PORT = 3001;

const tasks: Record<string, any> = {};
const chatQueue: any[] = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || chatQueue.length === 0) return;

    isProcessing = true;
    const item = chatQueue.shift();

    try {
        const prompt = `Incoming feedback from localhost page:\n\n` +
            `1. [${item.selector}] (${item.location || 'unknown path'})\n` +
            `   "${item.text}"\n` +
            `   Context: \`${item.context.slice(0, 200).replace(/`/g, '')}...\`\n\n`;

        vscode.commands.executeCommand('workbench.action.chat.open', {
            query: prompt
        });

        // Wait a bit to avoid race conditions
        await new Promise(r => setTimeout(r, 5000));

        // Mark as done after handing off to chat
        if (tasks[item.id]) {
            tasks[item.id].status = 'done';
            vscode.window.showInformationMessage(`Task ${item.id} sent to chat.`);
        }

    } catch (e) {
        console.error("Failed to process item", e);
    } finally {
        isProcessing = false;
        // Process next
        if (chatQueue.length > 0) processQueue();
    }
}

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("Localhost Redliner");
    outputChannel.show(true);
    outputChannel.appendLine("Localhost Redliner activated — listening for UI feedback");

    // Start HTTP Server
    server = http.createServer((req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = req.url || '';

        // API: Submit Batch
        if (req.method === 'POST' && url === '/api/batch-comments') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const batch = data.batch || [];

                    if (batch.length > 0) {
                        vscode.window.showInformationMessage(`Received ${batch.length} comments! Queuing...`);

                        // Register tasks and add to queue
                        batch.forEach((item: any) => {
                            tasks[item.id] = { ...item, status: 'working' };
                            chatQueue.push(item);
                        });
                        processQueue();
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ok' }));
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            });
            return;
        }

        // API: Status Check
        if (req.method === 'GET' && url === '/api/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ tasks }));
            return;
        }

        // API: Mark Complete
        if (req.method === 'POST' && url === '/api/complete') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data.id && tasks[data.id]) {
                        tasks[data.id].status = 'done';
                        vscode.window.showInformationMessage(`Task ${data.id} marked done.`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'updated' }));
                    } else {
                        res.writeHead(404);
                        res.end('Not Found');
                    }
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            });
            return;
        }

        res.writeHead(404);
        res.end('Not Found');
    });

    server.listen(PORT, () => {
        outputChannel.appendLine(`Listening on port ${PORT}`);
    });

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            vscode.window.showErrorMessage(`Localhost Redliner: Port ${PORT} is already in use. Please stop other servers.`);
        } else {
            vscode.window.showErrorMessage(`Localhost Redliner error: ${err.message}`);
        }
    });

    context.subscriptions.push({
        dispose: () => {
            if (server) {
                server.close();
            }
        }
    });
}

export function deactivate() {
    if (server) {
        server.close();
    }
}
