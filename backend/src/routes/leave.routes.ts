import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { applyLeaveSchema, reviewLeaveSchema, listLeaveSchema } from '../validators/leave.validators';
import * as leave from '../controllers/leave.controller';

const router = Router();
router.use(authenticate, authenticatedLimiter);

// Own actions/views (declared before "/:id" so these literal segments win).
router.post('/', validate(applyLeaveSchema), leave.apply);
router.get('/me', validate(listLeaveSchema, 'query'), leave.listMine);
router.get('/balance/me', leave.balanceMine);
router.get('/balance/:employeeId', authorize('ADMIN'), leave.balanceFor);

// Admin.
router.get('/', authorize('ADMIN'), validate(listLeaveSchema, 'query'), leave.list);
router.patch('/:id/review', authorize('ADMIN'), validate(reviewLeaveSchema), leave.review);

// Ownership-gated (Admin bypasses in the service).
router.get('/:id', leave.getById);
router.patch('/:id/cancel', leave.cancel);

export default router;
