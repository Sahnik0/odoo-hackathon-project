import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';
import * as auth from '../controllers/auth.controller';

const router = Router();

// Public auth flow (Section 8). Rate limits per Section 2.
router.post('/register', registerLimiter, validate(registerSchema), auth.register);
router.post('/verify-email', validate(verifyEmailSchema), auth.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), auth.resendVerification);
router.post('/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), auth.resetPassword);

// Authenticated — must have a valid access token
router.post('/set-role', authenticate, auth.setRole);

export default router;
