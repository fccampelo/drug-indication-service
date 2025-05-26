import { Router } from 'express';
import { DrugIndicationController } from '@controllers/drug-indication.controller';
import { authenticateToken } from '@middleware/auth.middleware';
import {
  validateCreateDrugIndication,
  validateUpdateDrugIndication,
  validateMongoId,
  validateDrugName,
  validateICD10Code,
  validateSearchQuery,
  validatePaginationQuery,
} from '@middleware/drug-indication.validation';

const router = Router();
const controller = new DrugIndicationController();

/**
 * @swagger
 * tags:
 *   name: Drug Indications
 *   description: API para gerenciamento de indicações de medicamentos
 */

router.get(
  '/',
  validatePaginationQuery,
  controller.findAll.bind(controller),
);

router.get(
  '/search',
  validateSearchQuery,
  controller.search.bind(controller),
);

router.get(
  '/stats',
  controller.getStats.bind(controller),
);

router.get(
  '/drugs/:drugName',
  validateDrugName,
  controller.findByDrug.bind(controller),
);

router.get(
  '/icd10/:code',
  validateICD10Code,
  controller.findByICD10Code.bind(controller),
);

router.get(
  '/:id',
  validateMongoId,
  controller.findById.bind(controller),
);

router.post(
  '/',
  authenticateToken,
  validateCreateDrugIndication,
  controller.create.bind(controller),
);

router.put(
  '/:id',
  authenticateToken,
  validateMongoId,
  validateUpdateDrugIndication,
  controller.updateById.bind(controller),
);

router.delete(
  '/:id',
  authenticateToken,
  validateMongoId,
  controller.deleteById.bind(controller),
);

export default router; 