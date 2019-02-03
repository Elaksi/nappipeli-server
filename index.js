const SocketServer  = require('ws').Server;
const http = require("http");
const express = require("express");
const path = require('path');

const PORT = process.env.PORT || 5000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
  

const wss = new SocketServer({ server });

console.log("Started");

wss.on('connection', ws => {
  console.log("Client connected");
  ws.on('message', message => {
    console.log(`Message ${message} received`);
    we.send(`Message ${message} received`);
  });
  ws.send('Connection ready!')
});