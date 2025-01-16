import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js'; 
import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); 

const app = express();

app.use(express.json());

const startApp = async () => {
  await initMongoConnection();  
  setupServer();  
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

startApp();  