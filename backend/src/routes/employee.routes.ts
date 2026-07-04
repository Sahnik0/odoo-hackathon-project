import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesSchema,
} from '../validators/employee.validators';
import * as employee from '../controllers/employee.controller';

const router = Router();

// All employee routes require authentication + the per-user rate limit (Section 2).
router.use(authenticate, authenticatedLimiter);

// Admin-only list (paginated/search/sort/filter).
router.get('/', authorize('ADMIN'), validate(listEmployeesSchema, 'query'), employee.list);

// Current user's own profile (before /:id so "me" isn't treated as an id).
router.get('/me', employee.getMine);

// Admin creates an employee account.
router.post('/', authorize('ADMIN'), validate(createEmployeeSchema), employee.create);

// Read one — ownership enforced in the service (Admin any, Employee own).
router.get('/:id', employee.getById);

// Update — field-level RBAC enforced in the service.
router.patch('/:id', validate(updateEmployeeSchema), employee.update);

// Admin-only soft delete.
router.delete('/:id', authorize('ADMIN'), employee.remove);

export default router;
