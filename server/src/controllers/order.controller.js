import { Prisma } from '../../../generated/prisma/client.js';
import * as orderService from '../services/order.service.js';
export const getOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
};
export const getOrderByUid = async (req, res, next) => {
    try {
        const order = await orderService.getOrderByUid(String(req.params.uid));
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    }
    catch (err) {
        next(err);
    }
};
export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
};
export const updateOrder = async (req, res, next) => {
    try {
        const order = await orderService.updateOrder(String(req.params.uid), req.body);
        res.json(order);
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        next(err);
    }
};
export const deleteOrder = async (req, res, next) => {
    try {
        await orderService.deleteOrder(String(req.params.uid));
        res.status(204).send();
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        next(err);
    }
};
//# sourceMappingURL=order.controller.js.map