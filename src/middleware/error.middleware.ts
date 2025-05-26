import { Request, Response, NextFunction } from 'express';
import { AppError } from '@types';
import { env } from '@config/env';
import { logger } from '@utils/logger';

export const errorHandler = (error: Error, _req: Request, res: Response): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  logger.error(`Error: ${error.message}`, error.stack);

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
