const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files from dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in dev
    methods: ["GET", "POST"]
  }
});

// Store active rooms in memory
// Structure: { roomCode: { hostSocketId: string, players: [] } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- HOST EVENTS ---

  socket.on('create_room', (roomCode) => {
    rooms[roomCode] = {
      hostSocketId: socket.id,
      players: []
    };
    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by ${socket.id}`);
  });

  socket.on('host_update_state', ({ roomCode, payload }) => {
    // Relay the game state from Host to everyone in the room
    socket.to(roomCode).emit('update_state', payload);
  });

  // --- PLAYER EVENTS ---

  socket.on('join_room', ({ roomCode, player }) => {
    const room = rooms[roomCode];
    if (room) {
      socket.join(roomCode);
      // Notify the Host that a player joined
      io.to(room.hostSocketId).emit('player_joined', { ...player, socketId: socket.id });
      console.log(`Player ${player.name} joined room ${roomCode}`);
    } else {
      socket.emit('error_message', { message: 'Room not found' });
    }
  });

  socket.on('submit_answer', ({ roomCode, payload }) => {
    const room = rooms[roomCode];
    if (room) {
      // Forward answer to Host
      io.to(room.hostSocketId).emit('player_answer', payload);
    }
  });

  socket.on('submit_smash', ({ roomCode, payload }) => {
    const room = rooms[roomCode];
    if (room) {
      // Forward smash to Host
      io.to(room.hostSocketId).emit('player_smash', payload);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Optional: Cleanup empty rooms or notify host of player drop
  });
});

// Health check endpoint for hosting providers
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// SPA fallback for production - serve index.html for all non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});