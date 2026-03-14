import { Router, Request, Response, NextFunction } from 'express';
import { 
  createPaymentIntent, 
  getPayments, 
  processWebhook,
  cancelSubscription,
  updateSubscription
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/create-intent', createPaymentIntent);
router.get('/', getPayments);
router.post('/webhook', processWebhook as any);
router.post('/subscription/cancel', cancelSubscription);
router.put('/subscription/update', updateSubscription);

export default router;
