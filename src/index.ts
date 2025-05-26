import app from '@app';
import { connectDB } from '@config/db';
import { redisClient } from '@config/redis';
import { env } from '@config/env';
import { logger } from '@utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await redisClient.connect();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
      logger.info(`🔴 Redis connected: ${redisClient.isReady()}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      try {
        await redisClient.disconnect();
        logger.info('Redis connection closed.');
      } catch (error) {
        logger.error('Error closing Redis connection:', error);
      }

      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 