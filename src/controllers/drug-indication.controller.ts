import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { DrugIndicationService } from '@services/drug-indication.service';
import { ApiResponse, PaginatedResponse, AppError } from '@types';

const drugIndicationService = new DrugIndicationService();

/**
 * @swagger
 * components:
 *   schemas:
 *     DrugIndication:
 *       type: object
 *       required:
 *         - drug
 *         - sourceUrl
 *         - extractedSection
 *         - indication
 *         - description
 *         - icd10Codes
 *         - ageRange
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da indicação
 *         drug:
 *           type: string
 *           description: Nome do medicamento
 *         sourceUrl:
 *           type: string
 *           description: URL da fonte dos dados
 *         extractedSection:
 *           type: string
 *           description: Seção extraída da bula
 *         indication:
 *           type: string
 *           description: Nome da indicação médica
 *         description:
 *           type: string
 *           description: Descrição detalhada da indicação
 *         synonyms:
 *           type: array
 *           items:
 *             type: string
 *           description: Sinônimos da indicação
 *         icd10Codes:
 *           type: array
 *           items:
 *             type: string
 *           description: Códigos ICD-10 mapeados
 *         ageRange:
 *           type: string
 *           description: Faixa etária para a indicação
 *         limitations:
 *           type: string
 *           description: Limitações de uso
 *         mappingStatus:
 *           type: string
 *           enum: [mapped, unmapped, pending, review]
 *           description: Status do mapeamento
 *         mappingNotes:
 *           type: string
 *           description: Notas sobre o mapeamento
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class DrugIndicationController {
  /**
   * @swagger
   * /api/v1/drug-indications:
   *   post:
   *     summary: Criar nova indicação de medicamento
   *     tags: [Drug Indications]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DrugIndication'
   *     responses:
   *       201:
   *         description: Indicação criada com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Indicação já existe
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
        return;
      }

      const indication = await drugIndicationService.create(req.body);

      const response: ApiResponse = {
        success: true,
        data: indication,
        message: 'Drug indication created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications:
   *   get:
   *     summary: Listar indicações com paginação e filtros
   *     tags: [Drug Indications]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: drug
   *         schema:
   *           type: string
   *       - in: query
   *         name: indication
   *         schema:
   *           type: string
   *       - in: query
   *         name: mappingStatus
   *         schema:
   *           type: string
   *           enum: [mapped, unmapped, pending, review]
   *       - in: query
   *         name: icd10Code
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de indicações
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, drug, indication, mappingStatus, icd10Code } = req.query;

      const result = await drugIndicationService.findAll({
        page: Number(page),
        limit: Number(limit),
        drug: drug as string,
        indication: indication as string,
        mappingStatus: mappingStatus as string,
        icd10Code: icd10Code as string,
      });

      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/{id}:
   *   get:
   *     summary: Buscar indicação por ID
   *     tags: [Drug Indications]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Indicação encontrada
   *       404:
   *         description: Indicação não encontrada
   */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const indication = await drugIndicationService.findById(id);

      const response: ApiResponse = {
        success: true,
        data: indication,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/drugs/{drugName}:
   *   get:
   *     summary: Buscar indicações por medicamento
   *     tags: [Drug Indications]
   *     parameters:
   *       - in: path
   *         name: drugName
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de indicações do medicamento
   */
  async findByDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { drugName } = req.params;
      const indications = await drugIndicationService.findByDrug(drugName);

      const response: ApiResponse = {
        success: true,
        data: indications,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/icd10/{code}:
   *   get:
   *     summary: Buscar indicações por código ICD-10
   *     tags: [Drug Indications]
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de indicações com o código ICD-10
   */
  async findByICD10Code(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const indications = await drugIndicationService.findByICD10Code(code);

      const response: ApiResponse = {
        success: true,
        data: indications,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/search:
   *   get:
   *     summary: Buscar indicações com texto livre
   *     tags: [Drug Indications]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Resultados da busca
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q) {
        throw new AppError('Search query is required', 400);
      }

      const indications = await drugIndicationService.search(q as string);

      const response: ApiResponse = {
        success: true,
        data: indications,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/stats:
   *   get:
   *     summary: Obter estatísticas das indicações
   *     tags: [Drug Indications]
   *     responses:
   *       200:
   *         description: Estatísticas das indicações
   */
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await drugIndicationService.getStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/{id}:
   *   put:
   *     summary: Atualizar indicação por ID
   *     tags: [Drug Indications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DrugIndication'
   *     responses:
   *       200:
   *         description: Indicação atualizada com sucesso
   *       404:
   *         description: Indicação não encontrada
   */
  async updateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const indication = await drugIndicationService.updateById(id, req.body);

      const response: ApiResponse = {
        success: true,
        data: indication,
        message: 'Drug indication updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/drug-indications/{id}:
   *   delete:
   *     summary: Deletar indicação por ID
   *     tags: [Drug Indications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Indicação deletada com sucesso
   *       404:
   *         description: Indicação não encontrada
   */
  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await drugIndicationService.deleteById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Drug indication deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
