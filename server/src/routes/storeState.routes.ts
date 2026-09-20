import { Router } from 'express';
import * as storeStateController from '../controllers/storeState.controller.js';

const router = Router();

router.get('/', storeStateController.getStoreState);
router.put('/:id', storeStateController.updateStoreState);

export default router;