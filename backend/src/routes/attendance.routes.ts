import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  listAttendanceSchema,
  markAbsentSchema,
  viewQuerySchema,
} from '../validators/attendance.validators';
import * as attendance from '../controllers/attendance.controller';

const router = Router();
router.use(authenticate, authenticatedLimiter);

// Own actions/views.
router.post('/check-in', attendance.checkIn);
router.post('/check-out', attendance.checkOut);
router.get('/me', validate(viewQuerySchema, 'query'), attendance.myAttendance);

// Admin.
router.get('/', authorize('ADMIN'), validate(listAttendanceSchema, 'query'), attendance.list);
router.post('/mark-absent', authorize('ADMIN'), validate(markAbsentSchema), attendance.markAbsent);

export default router;
