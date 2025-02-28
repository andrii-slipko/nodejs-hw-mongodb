import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();

export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');
export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');