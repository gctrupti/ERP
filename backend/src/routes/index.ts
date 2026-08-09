import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import challanRoutes from './challan.routes';
import dashboardRoutes from './dashboard.routes';
import inventoryRoutes from './inventory.routes';
import reportsRoutes from './reports.routes';
import userRoutes from './user.routes';
import settingsRoutes from './settings.routes';
import activityRoutes from './activity.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/challans', challanRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/activity-logs', activityRoutes);

export default router;
