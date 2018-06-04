angular.
  module("webUI").
  component("chatBox", {
    templateUrl: "html/chat.html",
    controllerAs: "vm",
    controller: [ '$interval',
    function($interval){
      var vm = this;
      var socket = io.connect("http://localhost:4000");
      var output = document.getElementById("output"),
          feedback = document.getElementById("feedback");

      var typingUsers = {};
      var typingStatusTimeout = 5 * 1000; //5 seconds
      var lastKeystrokeTime = null;
      var monitorKeystrokes = null;

      function updateTypingUserMessage(){
        if(Object.keys(typingUsers).length > 1)
          feedback.innerHTML = "<p><em>Multiple users typing...</em></p>";
        else if(Object.keys(typingUsers).length == 1)
          feedback.innerHTML = "<p><em>" + Object.keys(typingUsers)[0] + " is typing a message ...</em></p>";
        else
          feedback.innerHTML = "";
      }

      function detectTypingStatusChange(){
        if(Date.now() - lastKeystrokeTime > typingStatusTimeout){
          $interval.cancel(monitorKeystrokes);
          monitorKeystrokes = null;
          vm.emitTypingStatus(false);
        }
      }

      function removeTypingUser(user){
        delete typingUsers[user];
      }

      vm.sendMessage = function(){
        socket.emit("chat", {message: vm.message, user: vm.username});
        vm.message = "";
      };

      //receive messages
      socket.on("chat", function(data){
        removeTypingUser(data.user);
        updateTypingUserMessage();
        output.innerHTML += "<p><strong>" + data.user + "</strong>: " + data.message + "</p>";
      });

      vm.emitTypingStatus = function(typingStatus){
        socket.emit("typing", {user: vm.username, typing: typingStatus});
        lastKeystrokeTime = Date.now();
        if(monitorKeystrokes == null && typingStatus == true){
          monitorKeystrokes = $interval(detectTypingStatusChange, 1000);
        }
          
      };

      //receive typing status 
      socket.on("typing", function(typingStatus){
        if(typingStatus.typing == true){
          typingUsers[typingStatus.user] = Date.now();
        }
        else if(typingStatus.typing == false){
          removeTypingUser(typingStatus.user);
        }
        updateTypingUserMessage();
      });
    }]
  });
