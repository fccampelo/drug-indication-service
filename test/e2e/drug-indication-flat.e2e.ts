import request from 'supertest';
import app from '../../src/app';
import { DrugIndication } from '../../src/models/DrugIndication';
import { User } from '../../src/models/User';
import { CacheService } from '../../src/services/cache.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Drug Indication Flat E2E Tests with Cache', () => {
  let authToken: string;
  let testUserId: string;
  let testIndicationId: string;

  const testUser = {
    email: 'test@drugindication.com',
    password: 'TestPassword123',
    roles: ['admin'],
  };

  const testIndication = {
    drug: 'TestDrug',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=test',
    extractedSection: 'Test extracted section for indication testing',
    indication: 'Test Indication',
    description: 'Test description for the indication',
    synonyms: ['Test Synonym'],
    icd10Codes: ['T99.9'],
    ageRange: 'Adults',
    limitations: 'Test limitations',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Test mapping notes',
  };

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const user = new User({
      email: testUser.email,
      password: hashedPassword,
      roles: testUser.roles,
    });
    const savedUser = await user.save();
    testUserId = (savedUser._id as any).toString();

    authToken = jwt.sign(
      {
        userId: testUserId,
        email: testUser.email,
        roles: testUser.roles,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );
  });

  afterAll(async () => {
    await DrugIndication.deleteMany({});
    await User.findByIdAndDelete(testUserId);
    await CacheService.invalidateAll();
  });

  afterEach(async () => {
    await DrugIndication.deleteMany({});
    await CacheService.invalidateAll();
  });

  describe('Cache Integration Tests', () => {
    describe('GET /api/v1/drug-indications/:id with cache', () => {
      it('should cache indication on first request and return from cache on second', async () => {
        const indication = new DrugIndication(testIndication);
        const saved = await indication.save();
        testIndicationId = (saved._id as any).toString();

        const response1 = await request(app).get(`/api/v1/drug-indications/${testIndicationId}`).expect(200);

        expect(response1.body.success).toBe(true);
        expect(response1.body.data._id).toBe(testIndicationId);

        const cachedData = await CacheService.getById(testIndicationId);
        expect(cachedData).toBeTruthy();
        expect(cachedData?.drug).toBe(testIndication.drug);

        const response2 = await request(app).get(`/api/v1/drug-indications/${testIndicationId}`).expect(200);

        expect(response2.body.success).toBe(true);
        expect(response2.body.data._id).toBe(testIndicationId);
      });
    });

    describe('PUT /api/v1/drug-indications/:id with cache invalidation', () => {
      it('should invalidate cache when indication is updated', async () => {
        const indication = new DrugIndication(testIndication);
        const saved = await indication.save();
        testIndicationId = (saved._id as any).toString();

        await request(app).get(`/api/v1/drug-indications/${testIndicationId}`).expect(200);

        let cachedData = await CacheService.getById(testIndicationId);
        expect(cachedData).toBeTruthy();

        const updateData = {
          description: 'Updated description',
          limitations: 'Updated limitations',
        };

        await request(app)
          .put(`/api/v1/drug-indications/${testIndicationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        cachedData = await CacheService.getById(testIndicationId);
        expect(cachedData).toBeNull();
      });
    });

    describe('DELETE /api/v1/drug-indications/:id with cache invalidation', () => {
      it('should invalidate cache when indication is deleted', async () => {
        const indication = new DrugIndication(testIndication);
        const saved = await indication.save();
        testIndicationId = (saved._id as any).toString();

        await request(app).get(`/api/v1/drug-indications/${testIndicationId}`).expect(200);

        let cachedData = await CacheService.getById(testIndicationId);
        expect(cachedData).toBeTruthy();

        await request(app)
          .delete(`/api/v1/drug-indications/${testIndicationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        cachedData = await CacheService.getById(testIndicationId);
        expect(cachedData).toBeNull();
      });
    });

    describe('GET /api/v1/drug-indications/drugs/:drugName with cache', () => {
      it('should cache drug indications and return from cache on subsequent requests', async () => {
        const drugName = 'Dupixent';

        const indications = [
          { ...testIndication, drug: drugName, indication: 'Atopic Dermatitis' },
          { ...testIndication, drug: drugName, indication: 'Asthma' },
        ];

        for (const indication of indications) {
          await new DrugIndication(indication).save();
        }

        const response1 = await request(app).get(`/api/v1/drug-indications/drugs/${drugName}`).expect(200);

        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toHaveLength(2);

        const cachedData = await CacheService.getByDrug(drugName);
        expect(cachedData).toBeTruthy();
        expect(cachedData).toHaveLength(2);

        const response2 = await request(app).get(`/api/v1/drug-indications/drugs/${drugName}`).expect(200);

        expect(response2.body.success).toBe(true);
        expect(response2.body.data).toHaveLength(2);
      });
    });

    describe('GET /api/v1/drug-indications/search with cache', () => {
      it('should cache search results', async () => {
        const indications = [
          {
            ...testIndication,
            drug: 'Dupixent',
            indication: 'Atopic Dermatitis',
            description: 'Skin condition treatment',
          },
          { ...testIndication, drug: 'Aspirin', indication: 'Pain Relief', description: 'Pain management medication' },
        ];

        for (const indication of indications) {
          await new DrugIndication(indication).save();
        }

        const searchQuery = 'Atopic';

        const response1 = await request(app).get(`/api/v1/drug-indications/search?q=${searchQuery}`).expect(200);

        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toHaveLength(1);

        const cachedData = await CacheService.getSearch(searchQuery);
        expect(cachedData).toBeTruthy();
        expect(cachedData).toHaveLength(1);

        const response2 = await request(app).get(`/api/v1/drug-indications/search?q=${searchQuery}`).expect(200);

        expect(response2.body.success).toBe(true);
        expect(response2.body.data).toHaveLength(1);
      });
    });

    describe('GET /api/v1/drug-indications/stats with cache', () => {
      it('should cache statistics', async () => {
        const indications = [
          { ...testIndication, drug: 'DrugA', mappingStatus: 'mapped' as const },
          { ...testIndication, drug: 'DrugB', mappingStatus: 'mapped' as const },
          { ...testIndication, drug: 'DrugC', mappingStatus: 'pending' as const },
        ];

        for (const indication of indications) {
          await new DrugIndication(indication).save();
        }

        const response1 = await request(app).get('/api/v1/drug-indications/stats').expect(200);

        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toHaveProperty('totalIndications', 3);

        const cachedData = await CacheService.getStats();
        expect(cachedData).toBeTruthy();
        expect(cachedData.totalIndications).toBe(3);

        const response2 = await request(app).get('/api/v1/drug-indications/stats').expect(200);

        expect(response2.body.success).toBe(true);
        expect(response2.body.data).toHaveProperty('totalIndications', 3);
      });
    });

    describe('POST /api/v1/drug-indications with cache invalidation', () => {
      it('should invalidate all caches when new indication is created', async () => {
        await new DrugIndication(testIndication).save();

        await request(app).get('/api/v1/drug-indications/stats').expect(200);

        let cachedStats = await CacheService.getStats();
        expect(cachedStats).toBeTruthy();

        const newIndication = {
          ...testIndication,
          drug: 'NewDrug',
          indication: 'New Indication',
        };

        await request(app)
          .post('/api/v1/drug-indications')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newIndication)
          .expect(201);

        cachedStats = await CacheService.getStats();
        expect(cachedStats).toBeNull();
      });
    });
  });

  describe('POST /api/v1/drug-indications', () => {
    it('should create a new drug indication with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/drug-indications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testIndication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drug).toBe(testIndication.drug);
      expect(response.body.data.indication).toBe(testIndication.indication);
      expect(response.body.message).toBe('Drug indication created successfully');

      testIndicationId = response.body.data._id;
    });

    it('should return 401 when no auth token provided', async () => {
      const response = await request(app).post('/api/v1/drug-indications').send(testIndication).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = { ...testIndication } as any;
      delete invalidData.drug;

      const response = await request(app)
        .post('/api/v1/drug-indications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    it('should return 409 when duplicate drug+indication combination', async () => {
      await request(app)
        .post('/api/v1/drug-indications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testIndication)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/drug-indications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testIndication)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/drug-indications', () => {
    beforeEach(async () => {
      const indications = [
        { ...testIndication, drug: 'DrugA', indication: 'IndicationA' },
        { ...testIndication, drug: 'DrugB', indication: 'IndicationB' },
        { ...testIndication, drug: 'DrugA', indication: 'IndicationC' },
      ];

      for (const indication of indications) {
        await new DrugIndication(indication).save();
      }
    });

    it('should return paginated list of drug indications', async () => {
      const response = await request(app).get('/api/v1/drug-indications').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1,
      });
    });

    it('should filter by drug name', async () => {
      const response = await request(app).get('/api/v1/drug-indications?drug=DrugA').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((item: any) => item.drug === 'DrugA')).toBe(true);
    });

    it('should filter by mapping status', async () => {
      const response = await request(app).get('/api/v1/drug-indications?mappingStatus=mapped').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((item: any) => item.mappingStatus === 'mapped')).toBe(true);
    });

    it('should apply pagination correctly', async () => {
      const response = await request(app).get('/api/v1/drug-indications?page=1&limit=2').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        pages: 2,
      });
    });
  });

  describe('GET /api/v1/drug-indications/:id', () => {
    beforeEach(async () => {
      const indication = new DrugIndication(testIndication);
      const saved = await indication.save();
      testIndicationId = (saved._id as any).toString();
    });

    it('should return drug indication by ID', async () => {
      const response = await request(app).get(`/api/v1/drug-indications/${testIndicationId}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testIndicationId);
      expect(response.body.data.drug).toBe(testIndication.drug);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/v1/drug-indications/${nonExistentId}`).expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/v1/drug-indications/invalid-id').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/drug-indications/drugs/:drugName', () => {
    beforeEach(async () => {
      const indications = [
        { ...testIndication, drug: 'Dupixent', indication: 'Atopic Dermatitis' },
        { ...testIndication, drug: 'Dupixent', indication: 'Asthma' },
        { ...testIndication, drug: 'OtherDrug', indication: 'Other Indication' },
      ];

      for (const indication of indications) {
        await new DrugIndication(indication).save();
      }
    });

    it('should return indications for specific drug', async () => {
      const response = await request(app).get('/api/v1/drug-indications/drugs/Dupixent').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((item: any) => item.drug === 'Dupixent')).toBe(true);
    });

    it('should return empty array for non-existent drug', async () => {
      const response = await request(app).get('/api/v1/drug-indications/drugs/NonExistentDrug').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/drug-indications/search', () => {
    beforeEach(async () => {
      const indications = [
        {
          ...testIndication,
          drug: 'Dupixent',
          indication: 'Atopic Dermatitis',
          description: 'Skin condition treatment',
        },
        { ...testIndication, drug: 'Aspirin', indication: 'Pain Relief', description: 'Pain management medication' },
      ];

      for (const indication of indications) {
        await new DrugIndication(indication).save();
      }
    });

    it('should search across multiple fields', async () => {
      const response = await request(app).get('/api/v1/drug-indications/search?q=Atopic').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].indication).toBe('Atopic Dermatitis');
    });

    it('should return 400 when search query is missing', async () => {
      const response = await request(app).get('/api/v1/drug-indications/search').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/drug-indications/:id', () => {
    beforeEach(async () => {
      const indication = new DrugIndication(testIndication);
      const saved = await indication.save();
      testIndicationId = (saved._id as any).toString();
    });

    it('should update drug indication successfully', async () => {
      const updateData = {
        description: 'Updated description',
        limitations: 'Updated limitations',
      };

      const response = await request(app)
        .put(`/api/v1/drug-indications/${testIndicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.limitations).toBe(updateData.limitations);
      expect(response.body.message).toBe('Drug indication updated successfully');
    });

    it('should return 401 when no auth token provided', async () => {
      const response = await request(app)
        .put(`/api/v1/drug-indications/${testIndicationId}`)
        .send({ description: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/v1/drug-indications/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/drug-indications/:id', () => {
    beforeEach(async () => {
      const indication = new DrugIndication(testIndication);
      const saved = await indication.save();
      testIndicationId = (saved._id as any).toString();
    });

    it('should delete drug indication successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/drug-indications/${testIndicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drug indication deleted successfully');

      const deletedIndication = await DrugIndication.findById(testIndicationId);
      expect(deletedIndication).toBeNull();
    });

    it('should return 401 when no auth token provided', async () => {
      const response = await request(app).delete(`/api/v1/drug-indications/${testIndicationId}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/drug-indications/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/drug-indications/stats', () => {
    beforeEach(async () => {
      const indications = [
        { ...testIndication, drug: 'DrugA', mappingStatus: 'mapped' as const },
        { ...testIndication, drug: 'DrugB', mappingStatus: 'mapped' as const },
        { ...testIndication, drug: 'DrugC', mappingStatus: 'pending' as const },
      ];

      for (const indication of indications) {
        await new DrugIndication(indication).save();
      }
    });

    it('should return statistics', async () => {
      const response = await request(app).get('/api/v1/drug-indications/stats').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalIndications', 3);
      expect(response.body.data).toHaveProperty('uniqueDrugs', 3);
      expect(response.body.data).toHaveProperty('mappingStatus');
      expect(response.body.data.mappingStatus).toHaveProperty('mapped', 2);
      expect(response.body.data.mappingStatus).toHaveProperty('pending', 1);
    });
  });
});
