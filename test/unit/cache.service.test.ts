import { CacheService } from '../../src/services/cache.service';
import { redisClient } from '../../src/config/redis';
import { IDrugIndication } from '../../src/types';

// Mock do redisClient
jest.mock('../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn(),
    exists: jest.fn(),
  },
}));

// Mock do logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CacheService', () => {
  const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockIndication: IDrugIndication = {
    drug: 'TestDrug',
    sourceUrl: 'https://test.com',
    extractedSection: 'Test section',
    indication: 'Test Indication',
    description: 'Test description',
    synonyms: ['Test'],
    icd10Codes: ['T99.9'],
    ageRange: 'Adults',
    limitations: 'Test limitations',
    mappingStatus: 'mapped',
    mappingNotes: 'Test notes',
    createdAt: new Date('2025-05-26T02:08:01.595Z'),
    updatedAt: new Date('2025-05-26T02:08:01.595Z'),
  };

  const mockIndicationSerialized = {
    drug: 'TestDrug',
    sourceUrl: 'https://test.com',
    extractedSection: 'Test section',
    indication: 'Test Indication',
    description: 'Test description',
    synonyms: ['Test'],
    icd10Codes: ['T99.9'],
    ageRange: 'Adults',
    limitations: 'Test limitations',
    mappingStatus: 'mapped',
    mappingNotes: 'Test notes',
    createdAt: '2025-05-26T02:08:01.595Z',
    updatedAt: '2025-05-26T02:08:01.595Z',
  };

  describe('getById', () => {
    it('should return cached indication when found', async () => {
      const id = 'test-id';
      const cachedData = JSON.stringify(mockIndicationSerialized);
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getById(id);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:id:test-id');
      expect(result).toEqual(mockIndicationSerialized);
    });

    it('should return null when not found in cache', async () => {
      const id = 'test-id';
      mockRedisClient.get.mockResolvedValue(null);

      const result = await CacheService.getById(id);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:id:test-id');
      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      const id = 'test-id';
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await CacheService.getById(id);

      expect(result).toBeNull();
    });
  });

  describe('setById', () => {
    it('should cache indication by ID', async () => {
      const id = 'test-id';
      mockRedisClient.set.mockResolvedValue(true);

      await CacheService.setById(id, mockIndication);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'drug_indication:id:test-id',
        JSON.stringify(mockIndication)
      );
    });

    it('should handle errors gracefully', async () => {
      const id = 'test-id';
      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));

      await expect(CacheService.setById(id, mockIndication)).resolves.not.toThrow();
    });
  });

  describe('getByDrug', () => {
    it('should return cached indications for drug', async () => {
      const drug = 'TestDrug';
      const cachedData = JSON.stringify([mockIndicationSerialized]);
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getByDrug(drug);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:drug:TestDrug');
      expect(result).toEqual([mockIndicationSerialized]);
    });

    it('should return null when not found', async () => {
      const drug = 'TestDrug';
      mockRedisClient.get.mockResolvedValue(null);

      const result = await CacheService.getByDrug(drug);

      expect(result).toBeNull();
    });
  });

  describe('setByDrug', () => {
    it('should cache indications by drug', async () => {
      const drug = 'TestDrug';
      const indications = [mockIndication];
      mockRedisClient.set.mockResolvedValue(true);

      await CacheService.setByDrug(drug, indications);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'drug_indication:drug:TestDrug',
        JSON.stringify(indications)
      );
    });
  });

  describe('getByICD10', () => {
    it('should return cached indications for ICD-10 code', async () => {
      const code = 'T99.9';
      const cachedData = JSON.stringify([mockIndicationSerialized]);
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getByICD10(code);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:icd10:T99.9');
      expect(result).toEqual([mockIndicationSerialized]);
    });
  });

  describe('getSearch', () => {
    it('should return cached search results', async () => {
      const query = 'TestQuery';
      const cachedData = JSON.stringify([mockIndicationSerialized]);
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getSearch(query);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:search:testquery');
      expect(result).toEqual([mockIndicationSerialized]);
    });

    it('should convert query to lowercase', async () => {
      const query = 'TESTQUERY';
      mockRedisClient.get.mockResolvedValue(null);

      await CacheService.getSearch(query);

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:search:testquery');
    });
  });

  describe('getList', () => {
    it('should return cached list with filters', async () => {
      const filters = { page: 1, limit: 10, drug: 'TestDrug' };
      const cachedData = JSON.stringify({ data: [mockIndicationSerialized], pagination: {} });
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getList(filters);

      expect(mockRedisClient.get).toHaveBeenCalledWith(
        'drug_indication:list:drug:TestDrug|limit:10|page:1'
      );
      expect(result).toEqual({ data: [mockIndicationSerialized], pagination: {} });
    });

    it('should generate consistent cache keys for same filters', async () => {
      const filters1 = { page: 1, limit: 10, drug: 'TestDrug' };
      const filters2 = { drug: 'TestDrug', page: 1, limit: 10 };
      mockRedisClient.get.mockResolvedValue(null);

      await CacheService.getList(filters1);
      await CacheService.getList(filters2);

      expect(mockRedisClient.get).toHaveBeenNthCalledWith(1, 
        'drug_indication:list:drug:TestDrug|limit:10|page:1'
      );
      expect(mockRedisClient.get).toHaveBeenNthCalledWith(2, 
        'drug_indication:list:drug:TestDrug|limit:10|page:1'
      );
    });
  });

  describe('getStats', () => {
    it('should return cached stats', async () => {
      const stats = { totalIndications: 10, uniqueDrugs: 5 };
      const cachedData = JSON.stringify(stats);
      mockRedisClient.get.mockResolvedValue(cachedData);

      const result = await CacheService.getStats();

      expect(mockRedisClient.get).toHaveBeenCalledWith('drug_indication:stats');
      expect(result).toEqual(stats);
    });
  });

  describe('invalidateById', () => {
    it('should delete cache entry by ID', async () => {
      const id = 'test-id';
      mockRedisClient.del.mockResolvedValue(true);

      await CacheService.invalidateById(id);

      expect(mockRedisClient.del).toHaveBeenCalledWith('drug_indication:id:test-id');
    });
  });

  describe('invalidateByDrug', () => {
    it('should delete cache entry by drug', async () => {
      const drug = 'TestDrug';
      mockRedisClient.del.mockResolvedValue(true);

      await CacheService.invalidateByDrug(drug);

      expect(mockRedisClient.del).toHaveBeenCalledWith('drug_indication:drug:TestDrug');
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries with pattern', async () => {
      mockRedisClient.delPattern.mockResolvedValue(5);

      await CacheService.invalidateAll();

      expect(mockRedisClient.delPattern).toHaveBeenCalledWith('drug_indication:*');
    });
  });

  describe('invalidatePattern', () => {
    it('should delete cache entries matching pattern', async () => {
      const pattern = 'search:*';
      mockRedisClient.delPattern.mockResolvedValue(3);

      await CacheService.invalidatePattern(pattern);

      expect(mockRedisClient.delPattern).toHaveBeenCalledWith('drug_indication:search:*');
    });
  });
}); 