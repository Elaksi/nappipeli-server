const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});

console.log("Started");

wss.on('connection', ws => {
  wss.on('message', message => {
    console.log(`Message ${message} received`);
  })
  ws.send('Connection ready!')
});