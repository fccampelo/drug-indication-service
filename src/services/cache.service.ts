import { redisClient } from '@config/redis';
import { logger } from '@utils/logger';
import { IDrugIndication } from '@types';

export class CacheService {
  private static readonly CACHE_PREFIX = 'drug_indication';
  private static readonly CACHE_KEYS = {
    BY_ID: (id: string) => `${CacheService.CACHE_PREFIX}:id:${id}`,
    BY_DRUG: (drug: string) => `${CacheService.CACHE_PREFIX}:drug:${drug}`,
    BY_ICD10: (code: string) => `${CacheService.CACHE_PREFIX}:icd10:${code}`,
    SEARCH: (query: string) => `${CacheService.CACHE_PREFIX}:search:${query}`,
    STATS: () => `${CacheService.CACHE_PREFIX}:stats`,
    LIST: (filters: string) => `${CacheService.CACHE_PREFIX}:list:${filters}`,
  };

  /**
   * Gera uma chave de cache baseada nos filtros de busca
   */
  private static generateListCacheKey(filters: {
    page?: number;
    limit?: number;
    drug?: string;
    indication?: string;
    mappingStatus?: string;
    icd10Code?: string;
  }): string {
    const filterString = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return CacheService.CACHE_KEYS.LIST(filterString);
  }

  /**
   * Busca uma indicação por ID no cache
   */
  static async getById(id: string): Promise<IDrugIndication | null> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_ID(id);
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for drug indication ID: ${id}`);
        return JSON.parse(cached) as IDrugIndication;
      }
      
      logger.debug(`Cache miss for drug indication ID: ${id}`);
      return null;
    } catch (error) {
      logger.error('Error getting drug indication from cache:', error);
      return null;
    }
  }

  /**
   * Armazena uma indicação no cache por ID
   */
  static async setById(id: string, indication: IDrugIndication): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_ID(id);
      const serialized = JSON.stringify(indication);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug(`Cached drug indication ID: ${id}`);
    } catch (error) {
      logger.error('Error setting drug indication in cache:', error);
    }
  }

  /**
   * Busca indicações por medicamento no cache
   */
  static async getByDrug(drug: string): Promise<IDrugIndication[] | null> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_DRUG(drug);
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for drug: ${drug}`);
        return JSON.parse(cached) as IDrugIndication[];
      }
      
      logger.debug(`Cache miss for drug: ${drug}`);
      return null;
    } catch (error) {
      logger.error('Error getting drug indications by drug from cache:', error);
      return null;
    }
  }

  /**
   * Armazena indicações por medicamento no cache
   */
  static async setByDrug(drug: string, indications: IDrugIndication[]): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_DRUG(drug);
      const serialized = JSON.stringify(indications);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug(`Cached drug indications for drug: ${drug}`);
    } catch (error) {
      logger.error('Error setting drug indications by drug in cache:', error);
    }
  }

  /**
   * Busca indicações por código ICD-10 no cache
   */
  static async getByICD10(code: string): Promise<IDrugIndication[] | null> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_ICD10(code);
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for ICD-10 code: ${code}`);
        return JSON.parse(cached) as IDrugIndication[];
      }
      
      logger.debug(`Cache miss for ICD-10 code: ${code}`);
      return null;
    } catch (error) {
      logger.error('Error getting drug indications by ICD-10 from cache:', error);
      return null;
    }
  }

  /**
   * Armazena indicações por código ICD-10 no cache
   */
  static async setByICD10(code: string, indications: IDrugIndication[]): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_ICD10(code);
      const serialized = JSON.stringify(indications);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug(`Cached drug indications for ICD-10 code: ${code}`);
    } catch (error) {
      logger.error('Error setting drug indications by ICD-10 in cache:', error);
    }
  }

  /**
   * Busca resultados de pesquisa no cache
   */
  static async getSearch(query: string): Promise<IDrugIndication[] | null> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.SEARCH(query.toLowerCase());
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for search query: ${query}`);
        return JSON.parse(cached) as IDrugIndication[];
      }
      
      logger.debug(`Cache miss for search query: ${query}`);
      return null;
    } catch (error) {
      logger.error('Error getting search results from cache:', error);
      return null;
    }
  }

  /**
   * Armazena resultados de pesquisa no cache
   */
  static async setSearch(query: string, indications: IDrugIndication[]): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.SEARCH(query.toLowerCase());
      const serialized = JSON.stringify(indications);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug(`Cached search results for query: ${query}`);
    } catch (error) {
      logger.error('Error setting search results in cache:', error);
    }
  }

  /**
   * Busca lista paginada no cache
   */
  static async getList(filters: {
    page?: number;
    limit?: number;
    drug?: string;
    indication?: string;
    mappingStatus?: string;
    icd10Code?: string;
  }): Promise<any | null> {
    try {
      const cacheKey = CacheService.generateListCacheKey(filters);
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for list with filters: ${JSON.stringify(filters)}`);
        return JSON.parse(cached);
      }
      
      logger.debug(`Cache miss for list with filters: ${JSON.stringify(filters)}`);
      return null;
    } catch (error) {
      logger.error('Error getting list from cache:', error);
      return null;
    }
  }

  /**
   * Armazena lista paginada no cache
   */
  static async setList(filters: {
    page?: number;
    limit?: number;
    drug?: string;
    indication?: string;
    mappingStatus?: string;
    icd10Code?: string;
  }, result: any): Promise<void> {
    try {
      const cacheKey = CacheService.generateListCacheKey(filters);
      const serialized = JSON.stringify(result);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug(`Cached list with filters: ${JSON.stringify(filters)}`);
    } catch (error) {
      logger.error('Error setting list in cache:', error);
    }
  }

  /**
   * Busca estatísticas no cache
   */
  static async getStats(): Promise<any | null> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.STATS();
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug('Cache hit for stats');
        return JSON.parse(cached);
      }
      
      logger.debug('Cache miss for stats');
      return null;
    } catch (error) {
      logger.error('Error getting stats from cache:', error);
      return null;
    }
  }

  /**
   * Armazena estatísticas no cache
   */
  static async setStats(stats: any): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.STATS();
      const serialized = JSON.stringify(stats);
      
      await redisClient.set(cacheKey, serialized);
      logger.debug('Cached stats');
    } catch (error) {
      logger.error('Error setting stats in cache:', error);
    }
  }

  /**
   * Remove uma indicação específica do cache (quando atualizada)
   */
  static async invalidateById(id: string): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_ID(id);
      await redisClient.del(cacheKey);
      logger.debug(`Invalidated cache for drug indication ID: ${id}`);
    } catch (error) {
      logger.error('Error invalidating drug indication cache:', error);
    }
  }

  /**
   * Remove todos os caches relacionados a um medicamento
   */
  static async invalidateByDrug(drug: string): Promise<void> {
    try {
      const cacheKey = CacheService.CACHE_KEYS.BY_DRUG(drug);
      await redisClient.del(cacheKey);
      logger.debug(`Invalidated cache for drug: ${drug}`);
    } catch (error) {
      logger.error('Error invalidating drug cache:', error);
    }
  }

  /**
   * Remove todos os caches relacionados (quando uma indicação é atualizada/deletada)
   */
  static async invalidateAll(): Promise<void> {
    try {
      const pattern = `${CacheService.CACHE_PREFIX}:*`;
      const deletedCount = await redisClient.delPattern(pattern);
      logger.debug(`Invalidated ${deletedCount} cache entries`);
    } catch (error) {
      logger.error('Error invalidating all caches:', error);
    }
  }

  /**
   * Remove caches específicos baseados em padrões
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = `${CacheService.CACHE_PREFIX}:${pattern}`;
      const deletedCount = await redisClient.delPattern(fullPattern);
      logger.debug(`Invalidated ${deletedCount} cache entries with pattern: ${pattern}`);
    } catch (error) {
      logger.error('Error invalidating cache pattern:', error);
    }
  }
} 