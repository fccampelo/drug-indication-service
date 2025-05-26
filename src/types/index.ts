import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from '@models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export interface IUser {
  email: string;
  password: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  roles?: UserRole[];
}

export interface AuthResponse {
  token: string;
  user: Omit<IUser, 'password'>;
}

export interface JwtPayloadWithUser extends JwtPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_DB: number;
  REDIS_TTL: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IDrugIndication {
  drug: string;
  sourceUrl: string;
  extractedSection: string;
  indication: string;
  description: string;
  synonyms: string[];
  icd10Codes: string[];
  ageRange: string;
  limitations: string;
  mappingStatus: 'mapped' | 'unmapped' | 'pending' | 'review';
  mappingNotes: string;
  createdAt: Date;
  updatedAt: Date;
}
