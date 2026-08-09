import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';

const router = Router();

router.get('/', activityController.getRecentLogs);

export default router;
