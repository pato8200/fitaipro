import { Router } from 'express';
import { 
  getMembers, 
  getMemberById, 
  createMember, 
  updateMember, 
  deleteMember,
  trackAttendance,
  getAttendanceHistory
} from '../controllers/member.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.post('/attendance', trackAttendance);
router.get('/attendance/:memberId', getAttendanceHistory);

export default router;
