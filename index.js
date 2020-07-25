'use strict'

const WebSocket = require('ws');
const wsDispatcher = require('./src/server/wsDispatcher');
const httpDispatcher = require('./src/server/httpDispatcher');
let server = require('http').createServer();

const wss = new WebSocket.Server({ path: "/ws/", server: server });
server.on('request', httpDispatcher);

wss.on('connection', function connection(ws) {
  console.log("connected");
  ws.on('message', function incoming(message) {
    wsDispatcher.dispatch(ws, JSON.parse(message));
  });
});

function noop() { }

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

const port = 8081;

server.listen(port, function () {
  console.log(`server listening on ${port}`);
});