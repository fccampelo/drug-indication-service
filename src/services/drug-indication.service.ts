import { DrugIndication, DrugIndicationDocument } from '@models/DrugIndication';
import { IDrugIndication, AppError } from '@types';
import { CacheService } from '@services/cache.service';
import { logger } from '@utils/logger';

export class DrugIndicationService {
  async create(data: Omit<IDrugIndication, 'createdAt' | 'updatedAt'>): Promise<DrugIndicationDocument> {
    try {
      const indication = new DrugIndication(data);
      const savedIndication = await indication.save();

      await CacheService.invalidateAll();

      logger.info(`Created new drug indication: ${savedIndication._id}`);
      return savedIndication;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Drug indication already exists for this drug and indication combination', 409);
      }
      throw new AppError('Error creating drug indication', 500);
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    drug?: string;
    indication?: string;
    mappingStatus?: string;
    icd10Code?: string;
  }) {
    const { page = 1, limit = 10, drug, indication, mappingStatus, icd10Code } = options;

    const cachedResult = await CacheService.getList(options);
    if (cachedResult) {
      logger.debug('Returning cached list result');
      return cachedResult;
    }

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (drug) {
      filter.drug = new RegExp(drug, 'i');
    }
    if (indication) {
      filter.indication = new RegExp(indication, 'i');
    }
    if (mappingStatus) {
      filter.mappingStatus = mappingStatus;
    }
    if (icd10Code) {
      filter.icd10Codes = icd10Code;
    }

    const [data, total] = await Promise.all([
      DrugIndication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DrugIndication.countDocuments(filter),
    ]);

    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await CacheService.setList(options, result);

    return result;
  }

  async findById(id: string): Promise<DrugIndicationDocument> {
    const cachedIndication = await CacheService.getById(id);
    if (cachedIndication) {
      logger.debug(`Returning cached indication for ID: ${id}`);
      return cachedIndication as any;
    }

    const indication = await DrugIndication.findById(id);
    if (!indication) {
      throw new AppError('Drug indication not found', 404);
    }

    await CacheService.setById(id, indication.toObject());

    return indication;
  }

  async findByDrug(drugName: string): Promise<DrugIndicationDocument[]> {
    const cachedIndications = await CacheService.getByDrug(drugName);
    if (cachedIndications) {
      logger.debug(`Returning cached indications for drug: ${drugName}`);
      return cachedIndications as any;
    }

    const indications = await DrugIndication.find({
      drug: new RegExp(drugName, 'i'),
    }).sort({ indication: 1 });

    const indicationsData = indications.map(ind => ind.toObject());
    await CacheService.setByDrug(drugName, indicationsData);

    return indications;
  }

  async findByICD10Code(code: string): Promise<DrugIndicationDocument[]> {
    const cachedIndications = await CacheService.getByICD10(code);
    if (cachedIndications) {
      logger.debug(`Returning cached indications for ICD-10 code: ${code}`);
      return cachedIndications as any;
    }

    const indications = await DrugIndication.find({
      icd10Codes: code,
    }).sort({ drug: 1, indication: 1 });

    const indicationsData = indications.map(ind => ind.toObject());
    await CacheService.setByICD10(code, indicationsData);

    return indications;
  }

  async findByMappingStatus(status: string): Promise<DrugIndicationDocument[]> {
    return await DrugIndication.find({
      mappingStatus: status,
    }).sort({ createdAt: -1 });
  }

  async updateById(id: string, data: Partial<IDrugIndication>): Promise<DrugIndicationDocument> {
    const indication = await DrugIndication.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!indication) {
      throw new AppError('Drug indication not found', 404);
    }

    await CacheService.invalidateById(id);
    await CacheService.invalidateByDrug(indication.drug);
    logger.info(`Updated drug indication: ${id}`);
    return indication;
  }

  async deleteById(id: string): Promise<void> {
    const indication = await DrugIndication.findById(id);
    if (!indication) {
      throw new AppError('Drug indication not found', 404);
    }

    await DrugIndication.findByIdAndDelete(id);

    await CacheService.invalidateById(id);
    await CacheService.invalidateByDrug(indication.drug);

    logger.info(`Deleted drug indication: ${id}`);
  }

  async search(query: string): Promise<DrugIndicationDocument[]> {
    const cachedResults = await CacheService.getSearch(query);
    if (cachedResults) {
      logger.debug(`Returning cached search results for query: ${query}`);
      return cachedResults as any;
    }

    const searchRegex = new RegExp(query, 'i');

    const indications = await DrugIndication.find({
      $or: [
        { drug: searchRegex },
        { indication: searchRegex },
        { description: searchRegex },
        { synonyms: { $in: [searchRegex] } },
        { icd10Codes: { $in: [searchRegex] } },
      ],
    }).sort({ drug: 1, indication: 1 });

    const indicationsData = indications.map(ind => ind.toObject());
    await CacheService.setSearch(query, indicationsData);

    return indications;
  }

  async getStats() {
    const cachedStats = await CacheService.getStats();
    if (cachedStats) {
      logger.debug('Returning cached stats');
      return cachedStats;
    }

    const [totalIndications, drugCount, mappingStatusStats, icd10CodeCount] = await Promise.all([
      DrugIndication.countDocuments(),
      DrugIndication.distinct('drug').then(drugs => drugs.length),
      DrugIndication.aggregate([
        {
          $group: {
            _id: '$mappingStatus',
            count: { $sum: 1 },
          },
        },
      ]),
      DrugIndication.aggregate([
        { $unwind: '$icd10Codes' },
        {
          $group: {
            _id: '$icd10Codes',
            count: { $sum: 1 },
          },
        },
        { $count: 'total' },
      ]).then(result => result[0]?.total || 0),
    ]);

    const stats = {
      totalIndications,
      uniqueDrugs: drugCount,
      uniqueICD10Codes: icd10CodeCount,
      mappingStatus: mappingStatusStats.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    await CacheService.setStats(stats);

    return stats;
  }
}
