import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
const router = Router();
router.get('/', orderController.getOrders);
router.get('/:uid', orderController.getOrderByUid);
router.post('/', orderController.createOrder);
router.patch('/:uid', orderController.updateOrder);
router.delete('/:uid', orderController.deleteOrder);
