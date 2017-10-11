'use strict';

const net = require("net");
const port = 3000;
const server = net.createServer();

let clientPool = [];

function Client(socket) {
  this.id = Math.random()*1000;
  this.nickname = Math.floor(Math.random()*1000);
  this.socket = socket;
}

//return the index of this client


server.on('connection', (socket) => {

  const user = new Client(socket);

  //client.username = `User ${Math.random()}`;
  //add the client to the clientpool
  clientPool = [...clientPool, user];
  console.log(`clientPool are : ${clientPool}`);

  console.log("client connected!!!!!!");

  //we can send a string, a buffer, or even data
  socket.write("Welcome to Thao's Chatroom");

  //respond to a "data received" event, by writing whatever was typed in to all client
  socket.on('data', (buffer) => {
    let text = buffer.toString();
    //use /nickname <something> to change my name
    if(text.startsWith("@nickname")) {
      //console.log(`!!!!!!!!!!socket.nickname`, socket);
      let nickname = text.split(" ").slice(1).join(" ").slice(0, -2);

      let groupMessage = `${user.nickname} has changed their nickname to ${nickname}`
      user.nickname = nickname;
      clientPool.forEach(client => client.socket.write(groupMessage));
    }

    else if(text.startsWith("@dm ")) {
      let message = text.split(" ");

      console.log(message);

      const username = message[1];

      message.shift();
      message.shift();
      console.log(message);

      let finalMessage = message.join(" ");
      console.log(finalMessage);

      //get the username
      //send that client your text
      clientPool.forEach(client => {
        console.log(client.nickname + " DOES IT EQUAL " + username);
        console.log(client.nickname === username);
      });
      console.log("username in the dm " + username);
      let recipient = clientPool.filter(socket => socket.nickname === username);
      console.log("recipient length = " + recipient.length + " recipient " + recipient[0].nickname);
      //recipient => {
        //console.log(`hi from recipient.socket.write!!!!!!!`);
      recipient[0].socket.write(`${user.nickname}: ${finalMessage}`);
      //}
    }

    else if(text.startsWith("@list")) {

      let list = [];
      // Client.prototype.toString = function clientToString() {
      //   clientPool.map((client) => {list.push(client.nickname)});
      // }
      console.log(`the list is: `, list);
      clientPool.forEach(client => user.socket.write(`${client.nickname} `));
    }

    else if(text.startsWith("@quit")) {
      //delete your client/socket from the clientpool
      socket.end();

      clientPool.forEach(function(connection) {
        if(connection.socket !== user.socket) {
        connection.socket.write(`${user.nickname} left the chatroom.`);
        }
      })
    }

    else {
      clientPool.forEach(function(connection) {
        connection.socket.write(`${user.nickname}: ${text}`);
      });
    }

  });
  socket.on('error', (error) => console.log(error));
  socket.on('close', () => {
    let currentIndex = clientPool.indexOf(socket);
    let deletedSocket = clientPool.splice(currentIndex, 1);
  });
});

server.listen(port, () => {
  console.log('server is up ', port);
});
