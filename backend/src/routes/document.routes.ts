import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authenticatedLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { upload } from '../lib/upload';
import { listDocumentsSchema, reviewDocumentSchema } from '../validators/document.validators';
import * as document from '../controllers/document.controller';

const router = Router();
router.use(authenticate, authenticatedLimiter);

// Own actions/views (declared before "/:id").
router.post('/me', upload.single('file'), document.uploadMine);
router.get('/me', validate(listDocumentsSchema, 'query'), document.listMine);

// Admin.
router.post('/:employeeId/upload', authorize('ADMIN'), upload.single('file'), document.uploadFor);
router.get('/', authorize('ADMIN'), validate(listDocumentsSchema, 'query'), document.list);
router.patch('/:id/review', authorize('ADMIN'), validate(reviewDocumentSchema), document.review);

// Ownership-gated (Admin bypasses in the service).
router.get('/:id', document.getById);
router.get('/:id/file', document.download);
router.delete('/:id', document.remove);

export default router;
