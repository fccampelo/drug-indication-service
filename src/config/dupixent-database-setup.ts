import mongoose from 'mongoose';
import { DrugIndication } from '@models/DrugIndication';
import { env } from '@config/env';
import { logger } from '@utils/logger';

const dupixentData = [
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis whose disease is not adequately controlled with topical prescription therapies or when those therapies are not advisable.',
    indication: 'Atopic Dermatitis',
    description:
      'Treatment of moderate-to-severe atopic dermatitis in adult and pediatric patients aged 6 months and older whose disease is not adequately controlled with topical prescription therapies or when those therapies are not advisable.',
    synonyms: ['Eczema', 'Dermatitis', 'Atopic Eczema'],
    icd10Codes: ['L20.9'],
    ageRange: '≥6 months',
    limitations:
      'Use with or without topical corticosteroids. May be used with or without topical calcineurin inhibitors.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Direct mapping to ICD-10 code L20.9 (Atopic dermatitis, unspecified)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated as an add-on maintenance treatment in adult and adolescent patients with moderate-to-severe asthma with an eosinophilic phenotype or with oral corticosteroid dependent asthma.',
    indication: 'Asthma',
    description:
      'Add-on maintenance treatment in adult and adolescent patients with moderate-to-severe asthma with an eosinophilic phenotype or with oral corticosteroid dependent asthma.',
    synonyms: ['Bronchial Asthma', 'Allergic Asthma'],
    icd10Codes: ['J45.909'],
    ageRange: '≥12 years',
    limitations: 'Add-on maintenance treatment. Not for relief of acute bronchospasm or status asthmaticus.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to J45.909 (Unspecified asthma, uncomplicated)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated as an add-on treatment for adult patients with inadequately controlled chronic rhinosinusitis with nasal polyps (CRSwNP).',
    indication: 'Chronic Rhinosinusitis with Nasal Polyps',
    description:
      'Add-on treatment for adult patients with inadequately controlled chronic rhinosinusitis with nasal polyps (CRSwNP).',
    synonyms: ['CRSwNP', 'Nasal Polyps', 'Chronic Sinusitis with Polyps'],
    icd10Codes: ['J32.4'],
    ageRange: '≥18 years',
    limitations: 'Add-on treatment for inadequately controlled disease.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to J32.4 (Chronic pansinusitis)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated for the treatment of adult and pediatric patients aged 1 year and older and weighing at least 15 kg with eosinophilic esophagitis (EoE).',
    indication: 'Eosinophilic Esophagitis',
    description:
      'Treatment of adult and pediatric patients aged 1 year and older and weighing at least 15 kg with eosinophilic esophagitis (EoE).',
    synonyms: ['EoE', 'Allergic Esophagitis'],
    icd10Codes: ['K20.0'],
    ageRange: '≥1 year and ≥15 kg',
    limitations: 'Weight requirement of at least 15 kg.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to K20.0 (Eosinophilic esophagitis)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection: 'INDICATIONS AND USAGE: DUPIXENT is indicated for the treatment of prurigo nodularis in adults.',
    indication: 'Prurigo Nodularis',
    description: 'Treatment of prurigo nodularis in adults.',
    synonyms: ['Nodular Prurigo', 'Picker\'s Nodules'],
    icd10Codes: ['L28.1'],
    ageRange: '≥18 years',
    limitations: 'Adult patients only.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to L28.1 (Prurigo nodularis)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated as an add-on maintenance treatment for adult patients with uncontrolled chronic obstructive pulmonary disease (COPD) with an eosinophilic phenotype.',
    indication: 'Chronic Obstructive Pulmonary Disease',
    description:
      'Add-on maintenance treatment for adult patients with uncontrolled chronic obstructive pulmonary disease (COPD) with an eosinophilic phenotype.',
    synonyms: ['COPD', 'Chronic Bronchitis', 'Emphysema'],
    icd10Codes: ['J44.9'],
    ageRange: '≥18 years',
    limitations: 'Add-on maintenance treatment. Eosinophilic phenotype required.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to J44.9 (Chronic obstructive pulmonary disease, unspecified)',
  },
  {
    drug: 'Dupixent',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent',
    extractedSection:
      'INDICATIONS AND USAGE: DUPIXENT is indicated for the treatment of chronic spontaneous urticaria in adults and adolescents 12 years of age and older whose disease remains uncontrolled despite H1 antihistamine treatment.',
    indication: 'Chronic Spontaneous Urticaria',
    description:
      'Treatment of chronic spontaneous urticaria in adults and adolescents 12 years of age and older whose disease remains uncontrolled despite H1 antihistamine treatment.',
    synonyms: ['CSU', 'Chronic Urticaria', 'Chronic Hives'],
    icd10Codes: ['L50.1'],
    ageRange: '≥12 years',
    limitations: 'For patients uncontrolled despite H1 antihistamine treatment.',
    mappingStatus: 'mapped' as const,
    mappingNotes: 'Mapped to L50.1 (Idiopathic urticaria)',
  },
];

const setupDupixentDatabase = async (): Promise<void> => {
  try {
    logger.info('🔗 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('✅ Connected to MongoDB successfully');

    logger.info('📊 Creating indexes...');
    await DrugIndication.collection.createIndex({ drug: 1, indication: 1 }, { unique: true });
    logger.info('✅ Indexes created successfully');

    logger.info('💾 Inserting/updating Dupixent data...');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const data of dupixentData) {
      try {
        const indication = new DrugIndication({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await indication.save();
        insertedCount++;
        logger.info(`  ✅ Inserted: ${data.drug} - ${data.indication}`);
      } catch (error: any) {
        if (error.code === 11000) {
          await DrugIndication.findOneAndUpdate(
            { drug: data.drug, indication: data.indication },
            { ...data, updatedAt: new Date() },
            { new: true },
          );
          updatedCount++;
          logger.info(`  🔄 Updated: ${data.drug} - ${data.indication}`);
        } else {
          throw error;
        }
      }
    }

    logger.info('\n📈 Summary:');
    logger.info(`  • Inserted: ${insertedCount} new indications`);
    logger.info(`  • Updated: ${updatedCount} existing indications`);
    logger.info(`  • Total processed: ${dupixentData.length} indications`);

    logger.info('\n🔍 Verifying data...');
    const dupixentIndications = await DrugIndication.find({ drug: 'Dupixent' }).sort({ indication: 1 });
    logger.info(`✅ Found ${dupixentIndications.length} Dupixent indications in database`);

    dupixentIndications.forEach((indication, index) => {
      logger.info(`  ${index + 1}. ${indication.indication} (${indication.icd10Codes.join(', ')})`);
    });

    logger.info('\n🎉 Dupixent database setup completed successfully!');
  } catch (error) {
    logger.error('❌ Error setting up Dupixent database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  setupDupixentDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default setupDupixentDatabase;
