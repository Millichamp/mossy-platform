
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import listingsRoutes from './routes/listings';
import savedPropertiesRoutes from './routes/savedProperties';
import conversationsRoutes from './routes/conversations';
import viewingRequestsRoutes from './routes/viewingRequests';
import offersRoutes from './routes/offers';

console.log('Starting backend server...');

// Add error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mossy backend API is running!');
});

console.log('Setting up API routes...');
app.use('/api/listings', listingsRoutes);
app.use('/api/saved-properties', savedPropertiesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/viewing-requests', viewingRequestsRoutes);
app.use('/api/offers', offersRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Backend setup complete');
