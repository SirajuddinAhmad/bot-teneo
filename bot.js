require('dotenv').config();
const WebSocket = require('ws');

const ACCESS_TOKEN = process.env.TENEO_ACCESS_TOKEN?.trim();
const WS_URL = `wss://secure.ws.teneo.pro/websocket?accessToken=${ACCESS_TOKEN}&version=v0.2`;

let ws;
let pingInterval;

function connect() {
    console.log(`[${new Date().toLocaleTimeString()}] Menghubungkan ke Teneo Node...`);
    
    ws = new WebSocket(WS_URL, {
        headers: {
            'Origin': 'chrome-extension://emcclcoaglgcpoognfiggmhnhgabppkm',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    });

    ws.on('open', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Berhasil terhubung! Memulai heartbeat...`);
        
        // Kirim ping langsung setelah terhubung
        ws.send(JSON.stringify({ type: 'PING' }));

        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'PING' }));
                console.log(`[${new Date().toLocaleTimeString()}] PING terkirim -> Node Aktif`);
            }
        }, 10000);
    });

    ws.on('message', (data) => {
        try {
            const response = JSON.parse(data);
            console.log(`[${new Date().toLocaleTimeString()}] Pesan server:`, response);
        } catch (e) {
            console.log(`[${new Date().toLocaleTimeString()}] Pesan server:`, data.toString());
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`[${new Date().toLocaleTimeString()}] Terputus (${code}) | Alasan: ${reason.toString() || 'Tidak ada'}. Menyambung ulang dalam 10 detik...`);
        clearInterval(pingInterval);
        setTimeout(connect, 10000);
    });

    ws.on('error', (err) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error WebSocket:`, err.message);
    });
}

connect();
