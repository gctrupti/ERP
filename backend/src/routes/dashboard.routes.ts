import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/kpis', dashboardController.getKPIs);
// TODO: /charts/sales-trend if needed

export default router;
