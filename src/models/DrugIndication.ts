import mongoose, { Schema, Document } from 'mongoose';
import { IDrugIndication } from '@types';

export interface DrugIndicationDocument extends IDrugIndication, Document {}

const drugIndicationSchema = new Schema<DrugIndicationDocument>(
  {
    drug: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
      maxlength: [100, 'Drug name cannot exceed 100 characters'],
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true,
      validate: {
        validator: function (url: string) {
          return /^https?:\/\/.+/.test(url);
        },
        message: 'Please provide a valid URL',
      },
    },
    extractedSection: {
      type: String,
      required: [true, 'Extracted section is required'],
      trim: true,
    },
    indication: {
      type: String,
      required: [true, 'Indication is required'],
      trim: true,
      maxlength: [200, 'Indication cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    synonyms: {
      type: [String],
      default: [],
    },
    icd10Codes: {
      type: [String],
      required: [true, 'At least one ICD-10 code is required'],
      validate: {
        validator: function (codes: string[]) {
          return codes.length > 0 && codes.every(code => /^[A-Z]\d{2}(\.\d{1,2})?$/.test(code));
        },
        message: 'ICD-10 codes must be in valid format (e.g., L20.9, J45.909)',
      },
    },
    ageRange: {
      type: String,
      required: [true, 'Age range is required'],
      trim: true,
      maxlength: [50, 'Age range cannot exceed 50 characters'],
    },
    limitations: {
      type: String,
      trim: true,
      default: '',
    },
    mappingStatus: {
      type: String,
      enum: ['mapped', 'unmapped', 'pending', 'review'],
      default: 'pending',
    },
    mappingNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

drugIndicationSchema.index({ drug: 1, indication: 1 }, { unique: true });
drugIndicationSchema.index({ drug: 1 });
drugIndicationSchema.index({ icd10Codes: 1 });
drugIndicationSchema.index({ mappingStatus: 1 });
drugIndicationSchema.index({ createdAt: -1 });

drugIndicationSchema.statics.findByDrug = function (drugName: string) {
  return this.find({ drug: new RegExp(drugName, 'i') });
};

drugIndicationSchema.statics.findByICD10Code = function (code: string) {
  return this.find({ icd10Codes: code });
};

drugIndicationSchema.statics.findByIndication = function (indication: string) {
  return this.find({ indication: new RegExp(indication, 'i') });
};

drugIndicationSchema.statics.findByMappingStatus = function (status: string) {
  return this.find({ mappingStatus: status });
};

export const DrugIndication = mongoose.model<DrugIndicationDocument>('DrugIndication', drugIndicationSchema); 