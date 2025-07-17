
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import listingsRoutes from './routes/listings';
import savedPropertiesRoutes from './routes/savedProperties';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mossy backend API is running!');
});


app.use('/api/listings', listingsRoutes);
app.use('/api/saved-properties', savedPropertiesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
