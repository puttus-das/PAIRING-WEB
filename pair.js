import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import qrRouter from './qr.js';
import pairRouter from './pair.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

// Increase EventEmitter listeners
import('events').then((events) => {
    events.EventEmitter.defaultMaxListeners = 500;
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===============================
// API ROUTES
// ===============================

// QR API
app.use('/qr', qrRouter);

// Pairing Code API
app.use('/code', pairRouter);

// ===============================
// WEB PAGES
// ===============================

// Pair Code Page
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

// QR Code Page
app.get('/qrpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

// Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
    res.status(404).send({
        error: 'Page not found',
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log('================================');
    console.log('        PUTTUS-BOT SERVER');
    console.log('================================');
    console.log(`YouTube: @puttus-das`);
    console.log(`GitHub: @puttus-das`);
    console.log(`Server running on port ${PORT}`);
    console.log('================================');
});

export default app;

তারপর "pair.html"-এ শুধু এই অংশটা বদলাবে

পুরোনো:

const response = await axios(
    `/pair?number=${mobileNumber.replace(/[^0-9]/g, "")}`,
);

নতুন:

const response = await axios(
    `/code?number=${mobileNumber.replace(/[^0-9]/g, "")}`,
);

ব্যস। এরপর:

"https://puttus-das.onrender.com/pair" → page খুলবে
Generate Pair Code → "/code?number=..." → "pair.js" → pairing code return করবে।
