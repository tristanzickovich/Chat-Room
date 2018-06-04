var express = require("express");
var socket = require("socket.io");
var PORT = 4000;

//app setup
var app = express();
var server = app.listen(PORT, function(){
  console.log("listening to requests on port " + PORT)
});

//static files
app.use(express.static("public"));

//socket setup

var io = socket(server);

io.on("connection", function(socket){
  console.log("made socket connection", socket.id);
  socket.on("chat", function(data){
    io.sockets.emit("chat", data);
  });
  socket.on("typing", function(data){
    socket.broadcast.emit("typing", data);
  });
});
