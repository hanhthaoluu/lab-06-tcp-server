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

server.on('connection', (socket) => {

  const user = new Client(socket);
  clientPool = [...clientPool, user];
  socket.write("Welcome to Thao's Chatroom");

  socket.on('data', (buffer) => {
    let text = buffer.toString();

    if(text.startsWith("@nickname")) {
      let nickname = text.split(" ").slice(1).join(" ").slice(0, -2);
      let groupMessage = `${user.nickname} has changed their nickname to ${nickname}`
      user.nickname = nickname;
      clientPool.forEach(client => client.socket.write(groupMessage));
    }

    else if(text.startsWith("@dm ")) {
      let message = text.split(" ");
      const username = message[1];
      message.shift();
      message.shift();
      let finalMessage = message.join(" ");

      clientPool.forEach(client => {
        console.log(client.nickname + " DOES IT EQUAL " + username);
        console.log(client.nickname === username);
      });

      let recipient = clientPool.filter(socket => socket.nickname === username);
      recipient[0].socket.write(`${user.nickname}: ${finalMessage}`);

    }

    else if(text.startsWith("@list")) {
      let list = [];
      clientPool.forEach(client => user.socket.write(`${client.nickname} `));
    }

    else if(text.startsWith("@quit")) {
      socket.end();

      clientPool.forEach(function(connection) {
        if(connection.socket !== user.socket) {
        connection.socket.write(`${user.nickname} left the chatroom.`);
        }
      });
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
