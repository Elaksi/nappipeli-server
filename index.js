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

let counter = 0;

console.log("Started");



wss.on('connection', ws => {
  console.log("Client connected");
  ws.on('message', message => {
    console.log(`Message ${message} received`);
    ws.send(`Message ${message} received`);
    if(message == "Pushed"){
      counter++;
      ws.send(`Counter now ${counter}`);
      const prize = {type: "pushResponse", prize: 0,
      remaining: 1};
      console.log(JSON.stringify(prize));
      ws.send(JSON.stringify(prize));
      if(counter % 100 == 0){
        ws.send(`You won yeah!`);
      }
    }
  });
  ws.send('Connection ready!')
});