const WebSocket = require('ws');
const http = require("http")
const express = require("express")
const app = express()
const port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

const server = http.createServer(app)
server.listen(port)

const wss = new WebSocket.Server({server: server});

console.log("Started");

wss.on('connection', ws => {
  wss.on('message', message => {
    console.log(`Message ${message} received`);
  })
  ws.send('Connection ready!')
});