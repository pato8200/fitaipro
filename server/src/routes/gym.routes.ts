import { Router } from 'express';
import { createGym, getGyms, getGymById, updateGym, deleteGym, getGymMembers } from '../controllers/gym.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createGym);
router.get('/', getGyms);
router.get('/:id', getGymById);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);
router.get('/:id/members', getGymMembers);

export default router;
