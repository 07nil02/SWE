import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Dynamic CORS configuration for hosting and development
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL.trim());
  }

  app.use(
    cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // In development, allow localhost on any port
        if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
}
