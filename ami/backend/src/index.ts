import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { restrictToAllowedIps } from './middleware/ipRestriction';

import { authRouter } from './routers/auth';
import { modulesRouter } from './routers/modules';
import { chatRouter } from './routers/chat';
import { statsRouter } from './routers/stats';
import { demoRouter } from './routers/demo';
import { mockTestRouter } from './routers/mockTest';
import { voiceRouter } from './routers/voice';

const app = express();

// Trust reverse proxy headers (Vercel, Render, Cloudflare)
app.set('trust proxy', true);

// Allow local dev + any Vercel preview/production URL set via env
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow any *.vercel.app preview URL for this project
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use(fileUpload());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// IP Security Gate: Public visitors can view demo modules; live generation is locked to authorized IP
app.use(restrictToAllowedIps);

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stats', statsRouter);
app.use('/api/demo', demoRouter);
app.use('/api/mock-test', mockTestRouter);
app.use('/api/voice', voiceRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log('Server running on port ' + config.port);
});
