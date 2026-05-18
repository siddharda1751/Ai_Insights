import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import leadRoutes from './routes/lead.routes.js';
import { initializeEmailService } from './services/email.service.js';

dotenv.config();

// Connect to MongoDB before starting the server
await connectDB();

// Initialize email service (verify SMTP once, reuse connection)
await initializeEmailService();

const app = express();

// Configure CORS with frontend URL
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
};

console.log(`[CORS] Allowing origin: ${corsOptions.origin}`);

app.use(cors(corsOptions));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/leads', leadRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`[Server] Running on port ${PORT}`));
