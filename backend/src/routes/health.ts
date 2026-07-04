import { Router } from 'express';
import { ok } from '../lib/apiResponse';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness probe
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is up
 */
router.get('/health', (_req, res) => {
  ok(res, { status: 'ok', uptime: process.uptime() });
});

export default router;
