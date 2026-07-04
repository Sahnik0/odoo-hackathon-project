import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { listNotificationsSchema } from '../validators/notification.validators';
import * as notification from '../controllers/notification.controller';

const router = Router();
router.use(authenticate, authenticatedLimiter);

router.get('/', validate(listNotificationsSchema, 'query'), notification.list);
router.patch('/read-all', notification.markAllRead);
router.patch('/:id/read', notification.markRead);

export default router;
