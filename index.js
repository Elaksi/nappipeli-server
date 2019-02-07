const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');

const prizes = require('./Prizes');
const actionTypes = require('./ActionTypes');
const DATAFILE = 'data.json';
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Listening: " + PORT);
});

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});

let counter = 0;
let winners = [];
let jsonData;

//Create data file if doesn't exist
fs.writeFile(DATAFILE, "", { flag: 'wx' }, function (err) {
    console.log("Data file exists");
});

//Load saved counter and winners
fs.readFile(DATAFILE, 'utf8', (err, data) => {
  if(err) console.log(err);
  if(data != ""){
    jsonData = JSON.parse(data);
    if(jsonData.counter != 0){
      counter = jsonData.counter;
    }
    if(jsonData.winners != null){
      winners = jsonData.winners;
    }
  }
});

//Handle connection and events
io.on('connection', socket => {
  console.log('Client connected');
  
  //Send latest winner array to connected client
  emitWinners();
  
  //Handle button pushed
  socket.on(actionTypes.PUSH_BUTTON, (data) => {
    const playerName = data.playerName;
    console.log(`Player ${playerName} pushed a button`);
    counter++;
    console.log(`Counter now ${counter}`);
    
    const responseData = getPushResponse(counter);
    
    if(getPrize(counter) != prizes.NONE){
      console.log(`Prize won..!`);
      addWinner({time: new Date().getTime(), playerName: playerName, prize: getPrize(counter)});
      console.log(`Winner added`);
    }
    socket.emit(actionTypes.PUSH_SUCCESS, responseData);
    if (counter == 1000) counter = 0;
  });
  
  socket.on(actionTypes.WINNER_LIST, () => {
    emitWinners();
  });
  
  //Add new winner
  function addWinner(win){
    winners.unshift(win);
    if(winners.length > 10){
      winners.pop();
    }
    
    //Send new winner list to every client
    emitWinners();
    broadcastWinners();
  }
  
  //Send winner array to client
  function emitWinners(){
    console.log("Emitting winners");
    socket.emit(actionTypes.WINNER_LIST, winners);
  }
  
  //Send winner array to every client
  function broadcastWinners(){
    console.log("Emitting winners to everyone");
    socket.broadcast.emit(actionTypes.WINNER_LIST, winners);
  }
});

console.log("Server started");

//Make response for a client that pushed button
function getPushResponse(pushCount){
  return {prize: getPrize(counter),
      remaining: (100 - pushCount % 100)};
}

//Get prize for counter number
function getPrize(pushCount){
  if(pushCount % 500 == 0){
    return prizes.LARGE;
  }
  if(pushCount % 300 == 0){
    return prizes.MEDIUM;
  }
  if(pushCount % 100 == 0){
    return prizes.SMALL;
  }
  return prizes.NONE;
}

//Handle server closing and save data

let serverUp = true;

process.stdin.resume();

function exitHandler(options, err){
  if(!serverUp) return;
  console.log("Quitting in 5s...");
  serverUp = false;
  jsonData = JSON.stringify({counter: counter, winners: winners});
  fs.writeFileSync(DATAFILE, jsonData);
  setTimeout(() => {
    server.close();
    console.log("Quitting...");
    process.exit();
  }, 5000).unref();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));

process.on('SIGINT', exitHandler.bind(null, {exit:true}));

process.on('SIGTERM', exitHandler.bind(null, {exit:true}));

process.on('uncaughtException', exitHandler.bind(null, {exit:true}));