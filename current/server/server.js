// ~/my/scriptz/deeplike/server/server.js
const express = require('express');
const path = require('path');
require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');

// Import database pool
const db = require('./db');

// Import route handlers
const sharedRoutes = require('./shared');
const slsRoutes = require('./sls');
const deeperRoutes = require('./deeper');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to set Cache-Control headers
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files based on environment
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
} else {
    app.use(express.static(path.join(__dirname, '../public')));
}

// Test database connection on startup
console.log('Server.js loaded at', new Date().toISOString());

app.get('/api/db-health', async (req, res) => {
    try {
        const conn = await db.getConnection();
        await conn.ping();
        conn.release();
        res.json({status: 'healthy'});
    } catch (err) {
        console.error('DB health check failed:', err.stack);
        res.status(500).json({status: 'unhealthy', error: err.message});
    }
});

// Mount route handlers
app.use('/api/shared', sharedRoutes);
app.use('/api/sls', slsRoutes);
app.use('/api/deeper', deeperRoutes);

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
}

// Create HTTP server from Express app
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws/terminal' });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
            return;
        }
        if (data.type === 'run' && data.command) {
            // Example: data.command = 'ls -la'
            const shell = spawn(data.command, { shell: true });
            shell.stdout.on('data', (chunk) => {
                ws.send(JSON.stringify({ type: 'output', data: chunk.toString() }));
            });
            shell.stderr.on('data', (chunk) => {
                ws.send(JSON.stringify({ type: 'output', data: chunk.toString() }));
            });
            shell.on('close', (code) => {
                ws.send(JSON.stringify({ type: 'end', code }));
            });
        } else {
            ws.send(JSON.stringify({ type: 'error', error: 'Missing or invalid command' }));
        }
    });
});

// Start the server
server.listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});