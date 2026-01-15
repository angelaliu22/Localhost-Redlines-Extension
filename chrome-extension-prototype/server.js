const http = require('http');

const PORT = 3000;

const tasks = {};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Submit Comments
    if (req.method === 'POST' && req.url === '/api/batch-comments') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // batch: [{ id, text, ... }]
                if (data.batch && Array.isArray(data.batch)) {
                    data.batch.forEach(item => {
                        tasks[item.id] = { ...item, status: 'working' };
                        console.log(`[New Task] ID: ${item.id} | Text: ${item.text}`);
                    });
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

    // Get Status
    if (req.method === 'GET' && req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tasks }));
        return;
    }

    // Mark Complete (for simulation/CLI)
    // Usage: POST /api/complete body: {"id": 123}
    if (req.method === 'POST' && req.url === '/api/complete') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (tasks[data.id]) {
                    tasks[data.id].status = 'done';
                    console.log(`[Task Complete] ID: ${data.id}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'updated', task: tasks[data.id] }));
                } else {
                    res.writeHead(404);
                    res.end('Task not found');
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
    console.log(`[Localhost Redlines Extension] Listening for comments on http://localhost:${PORT}`);
});
