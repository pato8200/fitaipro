import { Router } from 'express';
import { 
  generateWorkout, 
  chatWithTrainer, 
  getNutritionAdvice,
  analyzeProgress,
  predictChurn
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post('/generate-workout', generateWorkout);
router.post('/chat', chatWithTrainer);
router.post('/nutrition', getNutritionAdvice);
router.post('/analyze-progress', analyzeProgress);
router.post('/predict-churn', predictChurn);

export default router;
