import { Router } from 'express';
import { 
  getGymAnalytics, 
  getMemberMetrics, 
  getRevenueMetrics,
  getAttendanceMetrics,
  getEquipmentUsage
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/gym/:gymId', getGymAnalytics);
router.get('/members', getMemberMetrics);
router.get('/revenue', getRevenueMetrics);
router.get('/attendance', getAttendanceMetrics);
router.get('/equipment', getEquipmentUsage);

export default router;
