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

import('events').then(events => {
    events.EventEmitter.defaultMaxListeners = 500;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// QR API
app.use('/qr', qrRouter);

// Pairing API
app.use('/pair', pairRouter);

// Pair page
app.get('/pairpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

// QR page
app.get('/qrpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(PORT, () => {
    console.log(`YouTube: @puttus-das`);
    console.log(`GitHub: @puttus-das`);
    console.log(`Server running on port ${PORT}`);
});

export default app;
