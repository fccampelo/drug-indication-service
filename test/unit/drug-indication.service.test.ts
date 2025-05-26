import { DrugIndicationService } from '../../src/services/drug-indication.service';
import { DrugIndication } from '../../src/models/DrugIndication';
import { AppError } from '../../src/types';

jest.mock('../../src/models/DrugIndication');

describe('DrugIndicationService', () => {
  let service: DrugIndicationService;

  beforeEach(() => {
    service = new DrugIndicationService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockIndicationData = {
      drug: 'Dupixent',
      sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
      extractedSection: 'Indications and Usage: DUPIXENT is indicated for...',
      indication: 'Atopic Dermatitis',
      description: 'Treatment of moderate-to-severe atopic dermatitis',
      synonyms: ['Eczema'],
      icd10Codes: ['L20.9'],
      ageRange: '≥6 months',
      limitations: 'Use with or without topical corticosteroids',
      mappingStatus: 'mapped' as const,
      mappingNotes: '',
    };

    it('should create a new drug indication successfully', async () => {
      const mockSavedIndication = { ...mockIndicationData, _id: 'mock-id' };
      const mockSave = jest.fn().mockResolvedValue(mockSavedIndication);

      (DrugIndication as any).mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.create(mockIndicationData);

      expect(DrugIndication).toHaveBeenCalledWith(mockIndicationData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockSavedIndication);
    });

    it('should throw AppError when duplicate key error occurs', async () => {
      const duplicateError = { code: 11000 };
      const mockSave = jest.fn().mockRejectedValue(duplicateError);

      (DrugIndication as any).mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(service.create(mockIndicationData)).rejects.toThrow(
        new AppError('Drug indication already exists for this drug and indication combination', 409),
      );
    });

    it('should throw AppError for other database errors', async () => {
      const dbError = new Error('Database connection failed');
      const mockSave = jest.fn().mockRejectedValue(dbError);

      (DrugIndication as any).mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(service.create(mockIndicationData)).rejects.toThrow(
        new AppError('Error creating drug indication', 500),
      );
    });
  });

  describe('findById', () => {
    it('should return indication when found', async () => {
      const mockIndication = {
        _id: 'mock-id',
        drug: 'Dupixent',
        toObject: jest.fn().mockReturnValue({ _id: 'mock-id', drug: 'Dupixent' }),
      };
      (DrugIndication.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIndication);

      const result = await service.findById('mock-id');

      expect(DrugIndication.findById).toHaveBeenCalledWith('mock-id');
      expect(result).toEqual(mockIndication);
    });

    it('should throw AppError when indication not found', async () => {
      (DrugIndication.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(new AppError('Drug indication not found', 404));
    });
  });

  describe('updateById', () => {
    it('should update indication successfully', async () => {
      const updateData = { description: 'Updated description' };
      const mockUpdatedIndication = { _id: 'mock-id', drug: 'Dupixent', ...updateData };

      (DrugIndication.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(mockUpdatedIndication);

      const result = await service.updateById('mock-id', updateData);

      expect(DrugIndication.findByIdAndUpdate).toHaveBeenCalledWith(
        'mock-id',
        { ...updateData, updatedAt: expect.any(Date) },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(mockUpdatedIndication);
    });

    it('should throw AppError when indication not found for update', async () => {
      (DrugIndication.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(service.updateById('non-existent-id', {})).rejects.toThrow(
        new AppError('Drug indication not found', 404),
      );
    });
  });

  describe('deleteById', () => {
    it('should delete indication successfully', async () => {
      const mockIndication = { _id: 'mock-id', drug: 'Dupixent' };
      (DrugIndication.findById as jest.Mock) = jest.fn().mockResolvedValue(mockIndication);
      (DrugIndication.findByIdAndDelete as jest.Mock) = jest.fn().mockResolvedValue(mockIndication);

      await service.deleteById('mock-id');

      expect(DrugIndication.findById).toHaveBeenCalledWith('mock-id');
      expect(DrugIndication.findByIdAndDelete).toHaveBeenCalledWith('mock-id');
    });

    it('should throw AppError when indication not found for deletion', async () => {
      (DrugIndication.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(service.deleteById('non-existent-id')).rejects.toThrow(
        new AppError('Drug indication not found', 404),
      );
    });
  });
}); 