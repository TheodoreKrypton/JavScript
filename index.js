const WebSocket = require('ws');
const server = require('http').createServer();
const wsDispatcher = require('./src/server/wsDispatcher');
const httpDispatcher = require('./src/server/httpDispatcher');

const wss = new WebSocket.Server({ path: '/ws/', server });
server.on('request', httpDispatcher);

wss.on('connection', (ws) => {
  console.log('connected');
  ws.on('message', (message) => {
    wsDispatcher.dispatch(ws, JSON.parse(message));
  });
});

function noop() { }

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    // eslint-disable-next-line no-param-reassign
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

const port = 8081;

server.listen(port, () => {
  console.log(`server listening on ${port}`);
});
