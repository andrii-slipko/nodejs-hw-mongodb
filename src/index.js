import setupServer from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import dotenv from 'dotenv';
dotenv.config();

const startApp = async () => {
  await initMongoConnection();
  setupServer();
};

startApp();