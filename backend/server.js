import 'dotenv/config';
import express from 'express';
import { connectDB } from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
