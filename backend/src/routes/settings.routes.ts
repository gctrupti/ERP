import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.put('/notifications', settingsController.updateNotifications);

export default router;
