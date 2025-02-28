import dotenv from "dotenv";
dotenv.config();
console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET ? "Loaded" : "Not Loaded");
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "Loaded" : "Not Loaded");
import express from "express";
import cors from "cors";
import pino from "pino-http";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import contactsRouter from "./routes/contacts.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import authRoutes from "./routes/authRoutes.js";
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import path from "path"
import { UPLOAD_DIR } from './constants/index.js';

const setupServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    })
  );

  app.use("/auth", authRoutes);
  app.use("/contacts", contactsRouter);

  app.use('/uploads', express.static(UPLOAD_DIR));
  swaggerDocs(app);
  
  app.use(notFoundHandler);
  app.use(errorHandler);


  

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default setupServer;