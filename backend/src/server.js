const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const socketio = require("socket.io");
const http = require("http");

const routes = require("./routes");

const app = express();
const server = http.Server(app);
const io = socketio(server);

mongoose.connect(
  "mongodb://aircnc:aircnc@cluster0-shard-00-00-hvcvu.mongodb.net:27017,cluster0-shard-00-01-hvcvu.mongodb.net:27017,cluster0-shard-00-02-hvcvu.mongodb.net:27017/aircnc?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const connectedUsers = {};

io.on("connection", (socket) => {
  const { user_id } = socket.handshake.query;

  connectedUsers[user_id] = socket.id;
});

app.use((request, response, next) => {
  request.io = io;
  request.connectedUsers = connectedUsers;

  return next();
});

app.use(cors());
app.use(express.json());
app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(routes);

server.listen(3333);
