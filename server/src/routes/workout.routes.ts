import { Router } from 'express';
import { 
  getWorkouts, 
  getWorkoutById, 
  createWorkout, 
  logWorkout,
  getWorkoutStats
} from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);
router.post('/', createWorkout);
router.post('/log', logWorkout);
router.get('/stats/:userId', getWorkoutStats);

export default router;
