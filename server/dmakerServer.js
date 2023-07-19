require('dotenv').config();
require('./auth/passport');
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const users = require('./routes/users');

const messageRouter = require('./routes/messagesHandling');
const wofRouter = require('./routes/wofRoutes.js');
const dmakerRouter = require('./routes/dmakerRouter'); //samson's route
const homeRouter = require('./routes/homeRouter');



const port = 8080;
const distPath = path.resolve(__dirname, '..', 'dist');

//generate secret key
const app = express();
const uuid = require('uuid');
const secretKey = uuid.v4();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(distPath));
// users session
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/users', users);
app.use('/auth', authRoutes);
app.use('/wofRoutes', wofRouter);
app.use('/messagesHandling', messageRouter);
app.use('/', homeRouter);

// fill out routes
app.use('/decisionmaker', dmakerRouter);


// test server setup for sockets
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


io.on('connection', (socket) => {
  console.log(`a user connected ${socket.id}`);

  socket.on('hand', (data) => {
    console.log(data);
    socket.broadcast.emit('receive_hand', data);
  });
});





app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

server.listen(port, () => {
  console.log(`RPS Server listening at http://localhost:${port}`);
});



// app.listen(port, () => {
//   console.log(`RPS Server listening at http://127.0.0.1:${port}`);
// });

