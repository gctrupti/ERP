import { Router } from 'express';
import { userController } from '../controllers/user.controller';
// Needs an admin guard, assuming verifyAccessToken or similar is there.
// For now we assume the frontend sends the token and it's verified in a middleware.

const router = Router();

// In a real app we would add an auth middleware here
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

export default router;
