const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let queue = [];
let rooms = {};

function generateQuestion() {
  return {
    question: "∫ (2x)/(x²+1) dx",
    options: [
      "ln(x²+1) + C",
      "2ln(x²+1) + C",
      "1/(x²+1) + C",
      "arctan(x) + C"
    ],
    correctIndex: 0
  };
}

io.on("connection", (socket) => {

  socket.on("joinQueue", () => {
    queue.push(socket);

    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      const roomId = Math.random().toString(36).substring(7);
      p1.join(roomId);
      p2.join(roomId);

      const q = generateQuestion();
      rooms[roomId] = q;

      io.to(roomId).emit("matchFound");
      io.to(roomId).emit("newQuestion", q);
    }
  });

  socket.on("answer", ({ roomId, selected }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (selected === room.correctIndex) {
      io.to(roomId).emit("roundResult", {
        winner: socket.id
      });
    }
  });

  socket.on("disconnect", () => {
    queue = queue.filter(s => s !== socket);
  });

});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});