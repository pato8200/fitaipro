import { Router } from 'express';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass,
  bookClass,
  cancelBooking,
  getMemberBookings
} from '../controllers/class.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.post('/book', bookClass);
router.post('/cancel/:bookingId', cancelBooking);
router.get('/bookings/member/:memberId', getMemberBookings);

export default router;
