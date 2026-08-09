import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', reportsController.getOperationalReports);

export default router;
