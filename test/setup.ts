import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  const mongoVersion = process.env.MONGODB_VERSION || '6.0.9';

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: mongoVersion,
      downloadDir: './mongodb-binaries',

      checkMD5: process.env.CI !== 'true',
    },
    instance: {
      dbName: 'test-db',
      args: ['--quiet'],
      storageEngine: 'wiredTiger',
    },
    auth: {
      disable: true,
    },
  });
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.MONGO_URI = mongoUri;
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_DB = '1';
  process.env.REDIS_TTL = '3600';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.LOG_LEVEL = 'error';
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
