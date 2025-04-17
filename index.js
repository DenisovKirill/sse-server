const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

let clients = [];

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`event: connected\ndata: connected\n\n`);
  clients.push(res);
  sendSessionCount();

  const keepAlive = setInterval(() => {
    res.write(':\n\n');
  }, 10000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients = clients.filter((c) => c !== res);
    sendSessionCount();
  });
});

function sendSessionCount() {
  const data = `data: ${clients.length}\n\n`;
  console.log('[SSE] Sending session count:', clients.length);

  clients.forEach((res) => {
    try {
      res.write(`event: sessionCount\n${data}`);
    } catch (err) {
      console.warn('[SSE] Failed to write to client:', err);
    }
  });
}

app.listen(PORT, () => {
  console.log(`SSE server running at http://localhost:${PORT}`);
});
