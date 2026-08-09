const fs = require('fs');
const path = require('path');

const files = {
  'src/config/env.ts': `
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
  `,
  'src/errors/AppError.ts': `
export class AppError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
  `,
  'src/utils/jwt.ts': `
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string, role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};
  `,
  'src/utils/logger.ts': `
// Simple logger for now. Can be replaced with Winston/Pino.
export const logger = {
  info: (msg: string, meta?: any) => console.log(\`[INFO] \${msg}\`, meta || ''),
  error: (msg: string, meta?: any) => console.error(\`[ERROR] \${msg}\`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(\`[WARN] \${msg}\`, meta || ''),
};
  `,
  'src/middlewares/error.middleware.ts': `
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
  `,
  'src/middlewares/validate.middleware.ts': `
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
  `
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
}
console.log("Core backend files created.");
