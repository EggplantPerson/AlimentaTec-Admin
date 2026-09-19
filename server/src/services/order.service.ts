import { prisma } from '../lib/prisma.js';
import { io } from '../server.js';

export const getAllOrders = () => {
    return prisma.order.findMany();
};

export const getOrderByUid = (uid: string) => {
    return prisma.order.findUnique({ where: {uid}});
}

export const createOrder = async (data: {uid: string; id: number; products: string[]; total: number; notes: string}) => {
    const order = await prisma.order.create({ data });
    io.emit('order:created', order);
    return order;
};

export const updateOrder = async (uid: string, data: Partial<{ products: string[]; status: string; total: number; note: string }>) => {
    const order = await prisma.order.update({where: {uid}, data});
    io.emit('order:updated', order);
    return order;
};

export const deleteOrder = async (uid: string) => {
    const order = prisma.order.delete({where: {uid}});
    io.emit('order:deleted', order);
    return order;
};