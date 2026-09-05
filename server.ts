import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { RoomManager } from './server/roomManager.ts';
import { minesEngine } from './server/minesEngine.ts';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Socket.io initialization with CORS enabled
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const roomManager = new RoomManager(io);

  io.on('connection', socket => {
    roomManager.handleSocketEvents(socket);
  });

  // REST API Endpoints for Educational Play-Money Arena
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now(), mode: 'play_money_educational' });
  });

  app.get('/api/rooms', (req, res) => {
    res.json(roomManager.getPublicRooms());
  });

  // --- MINES CRYPTOGRAPHIC PROVABLY FAIR REST API ---
  app.get('/api/games/mines/ladder/:mineCount', (req, res) => {
    try {
      const mineCount = Math.max(1, Math.min(24, parseInt(req.params.mineCount, 10) || 3));
      const ladder = minesEngine.getMultiplierLadder(mineCount);
      res.json({ success: true, mineCount, ladder });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/games/mines/start', (req, res) => {
    try {
      const { betAmount, mineCount, clientSeed, nonce } = req.body;
      const parsedBet = Number(betAmount);
      const parsedMines = parseInt(mineCount, 10);

      if (!parsedBet || parsedBet <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid bet amount' });
      }
      if (!parsedMines || parsedMines < 1 || parsedMines > 24) {
        return res.status(400).json({ success: false, error: 'Mines count must be between 1 and 24' });
      }

      const result = minesEngine.startSession(parsedBet, parsedMines, clientSeed, nonce);
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/games/mines/reveal', (req, res) => {
    try {
      const { sessionId, tileIndex } = req.body;
      if (!sessionId || tileIndex === undefined) {
        return res.status(400).json({ success: false, error: 'Missing sessionId or tileIndex' });
      }

      const result = minesEngine.revealTile(sessionId, Number(tileIndex));
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/games/mines/cashout', (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Missing sessionId' });
      }

      const result = minesEngine.cashOut(sessionId);
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/games/mines/verify', (req, res) => {
    try {
      const { serverSeed, clientSeed, nonce, mineCount } = req.body;
      if (!serverSeed || !clientSeed || nonce === undefined || !mineCount) {
        return res.status(400).json({ success: false, error: 'Missing verification parameters' });
      }

      const result = minesEngine.verifyGame(serverSeed, clientSeed, Number(nonce), Number(mineCount));
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KhelClub Play-Money Multiplayer Server running on http://localhost:${PORT}`);
  });
}

startServer();
