import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import caseRoutes from './routes/cases.js';
import schemeRoutes from './routes/schemes.js';
import rewardRoutes from './routes/rewards.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(backendDirectory, '../frontend/dist');

export const app = express();

app.use(cors({ origin:true, credentials:true }));
app.use(express.json({ limit:'1mb' }));
app.use('/uploads', express.static(path.resolve(backendDirectory, 'uploads')));

app.get('/api/health', (_request, response) => response.json({
  success:true,
  message:'AshaCare API is healthy',
  data:{ database:'connected' }
}));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
  app.get(/.*/, (request, response, next) => {
    if (request.path.startsWith('/api') || request.path.startsWith('/uploads')) {
      next();
      return;
    }
    response.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((_request, response) => response.status(404).json({
  success:false,
  message:'Route not found'
}));

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.name === 'ValidationError' ? 400 : 500).json({
    success:false,
    message:error.message || 'Unexpected server error'
  });
});
