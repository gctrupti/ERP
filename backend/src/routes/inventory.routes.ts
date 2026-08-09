import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', inventoryController.getDashboard);
router.get('/movements', inventoryController.getMovements);
router.post('/adjust', inventoryController.adjustStock);

export default router;
