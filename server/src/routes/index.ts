import { Router } from 'express';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import storeStateRoutes from './storeState.routes.js';
import uploadRoutes from './upload.routes.js'

const router = Router();
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/storeState', storeStateRoutes);
router.use('/uploads', uploadRoutes);

export default router;