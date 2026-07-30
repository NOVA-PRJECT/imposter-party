const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { initSocketServer } = require('./lib/socketServer');

const app = express();
const port = parseInt(process.env.PORT || '4000', 10);
const frontendUrl = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: frontendUrl === '*' ? '*' : frontendUrl.split(','),
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint for hosting platforms like Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl === '*' ? '*' : frontendUrl.split(','),
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  addTrailingSlash: false,
});

initSocketServer(io);

httpServer.listen(port, () => {
  console.log(`> Imposter Group Backend ready on port ${port}`);
});
