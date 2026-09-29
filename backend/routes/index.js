import { Router } from 'express';
import healthRoutes from './health.routes.js';
import customersRoutes from './customers.routes.js';
import servicesRoutes from './services.routes.js';
import billsRoutes from './bills.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';
import styleAdvisorRoutes from './style-advisor.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/customers', customersRoutes);
router.use('/services', servicesRoutes);
router.use('/bills', billsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/style-advisor', styleAdvisorRoutes);

export default router;
