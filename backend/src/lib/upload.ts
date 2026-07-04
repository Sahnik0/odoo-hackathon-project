import multer from 'multer';
import { env } from '../config/env';

// Memory storage — the file buffer never touches disk until our own service
// code validates mimetype + size and writes it deliberately (document.service).
// This is what makes "reject with 422 before touching disk" (Section 2)
// unconditionally true, rather than relying on multer's own cleanup-on-reject.
// The size limit here is only a generous DoS backstop (largest allowed
// category, MAX_DOC_MB); precise per-category limits are enforced in the
// service where the parsed `category` field is available.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_DOC_MB * 1024 * 1024 },
});
