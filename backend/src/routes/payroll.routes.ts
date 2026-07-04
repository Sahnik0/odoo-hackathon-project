import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  upsertSalaryStructureSchema,
  generatePayrollSchema,
  listPayrollSchema,
} from '../validators/payroll.validators';
import * as payroll from '../controllers/payroll.controller';

const router = Router();
router.use(authenticate, authenticatedLimiter);

// Own view (before "/:id").
router.get('/me', validate(listPayrollSchema, 'query'), payroll.listMine);

// Salary structure — Employee read-only (ownership in service), Admin edits.
router.get('/salary/:employeeId', payroll.getSalaryStructure);
router.put(
  '/salary/:employeeId',
  authorize('ADMIN'),
  validate(upsertSalaryStructureSchema),
  payroll.upsertSalaryStructure,
);

// Admin: distinct explicit generate action + full list.
router.post('/generate', authorize('ADMIN'), validate(generatePayrollSchema), payroll.generate);
router.get('/', authorize('ADMIN'), validate(listPayrollSchema, 'query'), payroll.list);

// Ownership-gated single record (Admin bypasses in the service).
router.get('/:id', payroll.getById);

export default router;
