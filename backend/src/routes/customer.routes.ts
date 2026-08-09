import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/:id/followups', customerController.addFollowUp);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

export default router;
