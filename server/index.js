import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { initSocketIO } from './socket.js';
import { OPENAI_CONFIG } from './config/openai.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.IO on HTTP server
initSocketIO(httpServer);

// Connect Database (graceful memory fallback if offline)
connectDB();

// Middleware & CORS Configuration
const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const parseAllowedOrigins = () => {
  const configured = process.env.FRONTEND_URL;
  if (!configured) return defaultOrigins;
  const list = configured.split(',').map((url) => url.trim().replace(/\/$/, ''));
  return [...defaultOrigins, ...list];
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const allowed = parseAllowedOrigins();
      if (
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.url.startsWith('/api')) {
      console.log(`[${req.method}] ${req.url} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Comprehensive Health check endpoint (available at /health and /api/health)
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'ConvoAI Enterprise Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    subsystems: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-resilient',
      socketIO: 'active',
      openai: OPENAI_CONFIG.isConfigured ? 'configured' : 'fallback-simulation',
      activeModel: OPENAI_CONFIG.model,
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized error handler
app.use(errorHandler);

// Start HTTP & Socket server only when run directly
import { fileURLToPath } from 'url';
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 ConvoAI Backend Server is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO:    ws://localhost:${PORT}`);
    console.log(`🤖 AI Status:    http://localhost:${PORT}/api/ai/status`);
    console.log(`===============================================`);
  });
}

export { app, httpServer };
export default app;
