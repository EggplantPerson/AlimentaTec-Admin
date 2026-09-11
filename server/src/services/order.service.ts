import { prisma } from '../lib/prisma.js'

export const getAllOrders = () => {
    return prisma.order.findMany();
};

export const getOrderByUid = (uid: string) => {
    return prisma.order.findUnique({ where: {uid}});
}

export const createOrder = (data: {uid: string; id: number; products: string[]; total: number; notes: string}) => {
    return prisma.order.create({ data });
};

export const updateOrder = (uid: string, data: Partial<{ products: string[]; status: string; total: number; note: string }>) => {
    return prisma.order.update({where: {uid}, data});
};

export const deleteOrder = (uid: string) => {
    return prisma.order.delete({where: {uid}});
};