const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const unzipper = require('unzipper');
const { parseStringPromise } = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

// SCORM packages storage directory
const SCORM_DIR = path.join(__dirname, 'scorm_packages');
if (!fs.existsSync(SCORM_DIR)) {
  fs.mkdirSync(SCORM_DIR, { recursive: true });
}

// Multer storage for SCORM uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SCORM_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed'));
  }
}});

// Serve extracted SCORM packages statically
app.use('/scorm', express.static(SCORM_DIR));

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

// ==================== SCORM API ENDPOINTS ====================

// Parse SCORM manifest (imsmanifest.xml)
async function parseScormManifest(manifestPath) {
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const result = await parseStringPromise(content);
    
    const manifest = result.manifest || result;
    let entryPoint = 'index.html';
    let title = 'SCORM Package';
    let masteryScore = null;
    let version = '1.2';

    // Detect SCORM version
    if (manifest.$ && manifest.$['xmlns:adlcp']) {
      version = manifest.$['xmlns:adlcp'].includes('2004') ? '2004' : '1.2';
    }

    // Get title from organizations
    if (manifest.organizations && manifest.organizations[0]) {
      const org = manifest.organizations[0].organization;
      if (org && org[0] && org[0].title) {
        title = org[0].title[0];
      }
    }

    // Get launch resource (entry point)
    if (manifest.resources && manifest.resources[0] && manifest.resources[0].resource) {
      const resources = manifest.resources[0].resource;
      const launchResource = resources.find(r => r.$ && r.$.href);
      if (launchResource) {
        entryPoint = launchResource.$.href;
      }
    }

    // Get mastery score if present
    if (manifest.organizations && manifest.organizations[0]) {
      const org = manifest.organizations[0].organization;
      if (org && org[0] && org[0].item && org[0].item[0]) {
        const item = org[0].item[0];
        if (item['adlcp:masteryscore']) {
          masteryScore = parseInt(item['adlcp:masteryscore'][0], 10);
        }
      }
    }

    return { title, entryPoint, masteryScore, version };
  } catch (err) {
    console.error('Error parsing manifest:', err);
    return { title: 'SCORM Package', entryPoint: 'index.html', masteryScore: null, version: '1.2' };
  }
}

// Upload and extract SCORM package
app.post('/api/scorm/upload', upload.single('package'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const zipPath = req.file.path;
    const packageId = path.basename(zipPath, '.zip').replace(/[^a-zA-Z0-9-_]/g, '_');
    const extractDir = path.join(SCORM_DIR, packageId);

    // Create extraction directory
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    // Extract the ZIP file
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // Remove the original ZIP file
    fs.unlinkSync(zipPath);

    // Parse the manifest
    const manifestPath = path.join(extractDir, 'imsmanifest.xml');
    let metadata = { title: 'SCORM Package', entryPoint: 'index.html', masteryScore: null, version: '1.2' };
    
    if (fs.existsSync(manifestPath)) {
      metadata = await parseScormManifest(manifestPath);
    }

    // Build the manifest URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const manifestUrl = `${baseUrl}/scorm/${packageId}/${metadata.entryPoint}`;

    res.json({
      success: true,
      packageId,
      storagePath: extractDir,
      manifestUrl,
      metadata: {
        title: metadata.title,
        entryPoint: metadata.entryPoint,
        masteryScore: metadata.masteryScore,
        version: metadata.version
      }
    });
  } catch (err) {
    console.error('SCORM upload error:', err);
    res.status(500).json({ error: 'Failed to process SCORM package' });
  }
});

// Delete a SCORM package
app.delete('/api/scorm/package/:packageId', (req, res) => {
  try {
    const { packageId } = req.params;
    const packageDir = path.join(SCORM_DIR, packageId);

    if (fs.existsSync(packageDir)) {
      fs.rmSync(packageDir, { recursive: true, force: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('SCORM delete error:', err);
    res.status(500).json({ error: 'Failed to delete SCORM package' });
  }
});

// List all uploaded SCORM packages (filesystem level)
app.get('/api/scorm/packages', (req, res) => {
  try {
    const packages = fs.readdirSync(SCORM_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    res.json({ packages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list packages' });
  }
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