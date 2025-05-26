import { createClient, RedisClientType } from 'redis';
import { env } from '@config/env';
import { logger } from '@utils/logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`;

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Failed to get key ${key} from Redis:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }
      
      const options = ttl ? { EX: ttl } : { EX: env.REDIS_TTL };
      await this.client.set(key, value, options);
      return true;
    } catch (error) {
      logger.error(`Failed to set key ${key} in Redis:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache delete');
        return false;
      }
      
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to delete key ${key} from Redis:`, error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache pattern delete');
        return 0;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      logger.error(`Failed to delete pattern ${pattern} from Redis:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check existence of key ${key} in Redis:`, error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping flush');
        return false;
      }
      
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Failed to flush Redis:', error);
      return false;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

export const redisClient = new RedisClient();
export default redisClient; 