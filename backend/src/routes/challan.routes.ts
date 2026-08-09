import { Router } from 'express';
import { challanController } from '../controllers/challan.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', challanController.getAll);
router.get('/:id', challanController.getById);
router.get('/:id/pdf', challanController.exportPdf);
router.post('/', challanController.create);
router.post('/:id/confirm', challanController.confirm);
router.post('/:id/cancel', challanController.cancel);

export default router;
