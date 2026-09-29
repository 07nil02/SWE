import { Router, Request, Response } from 'express';
import categoryRoutes from './categoryRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const apiRouter = Router();

apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/rentals', rentalRoutes);
apiRouter.use('/', maintenanceRoutes);
apiRouter.use('/analytics', analyticsRoutes);

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Fleet & Vehicle Rental Operations API',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
