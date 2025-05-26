import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '@config/env';
import { errorHandler, notFound } from '@middleware/error.middleware';
import authRoutes from '@routes/auth.routes';
import drugIndicationRoutes from '@routes/drug-indication.routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\'', 'https://cdn.jsdelivr.net'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drug Indication API',
      version: '1.0.0',
      description: 'API for mapping drug indications to ICD-10 codes using AI',
      contact: {
        name: 'Drug Indication Service Team',
        email: 'support@drug-indication-service.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: env.NODE_ENV === 'production' 
          ? 'https://api.drug-indication-service.com' 
          : `http://localhost:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Drug Indications',
        description: 'Drug indication mapping and retrieval',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Drug Indication API Documentation',
}));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Drug Indication Service API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/drug-indications', drugIndicationRoutes);

app.use(notFound);

app.use(errorHandler);

export default app; 