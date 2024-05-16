const express = require('express');
const http = require('http');
const { routes } = require('./route/routes');
const { initializeSocket, handleSocketEvents, emitDataFromFirstElement } = require('./gameLogic');
const { serverPort } = require('./config/config');

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// Initialize routes
app.use('/', routes());


handleSocketEvents(io);
emitDataFromFirstElement(io);

// Start server
server.listen(serverPort, () => {
  console.log(`Server is running on http://localhost:${serverPort}`);
});
