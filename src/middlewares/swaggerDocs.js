import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';
import createHttpError from 'http-errors';
import { SWAGGER_PATH } from '../constants/index.js';

export const swaggerDocs = (app) => {
  console.log("Swagger file path:", SWAGGER_PATH);

  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf-8'));
    console.log("Swagger JSON successfully loaded");

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
    console.log("Swagger is available at /api-docs");
  } catch (err) {
    console.error("Error loading Swagger docs:", err);
    app.use('/api-docs', (req, res, next) => {
      next(createHttpError(500, "Can't load Swagger documentation"));
    });
  }
};