console.clear();
const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');
const {generateMessage,generateLocationMessage} = require('../src/utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // socket.emit('message', generateMessage('Welcome!'));
    //we want sent every one msg except the user just login
    //with broadcast method we can emit every body except own
    // socket.broadcast.emit('message',generateMessage('a new user has joined'));

    socket.on('join', ({ username, room }) => {
        //we can use join to join specific room
        socket.join(room);

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    });


    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', generateMessage(message));
        callback()
    });

    //for receive location
    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage',generateLocationMessage('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    //for disconnect user
    socket.on('disconnect',()=>{
       console.log('disconnect');
       io.emit('message',generateMessage('A user has left'));
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
});