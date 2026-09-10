import { prisma } from '../lib/prisma.js';
export const getAllOrders = () => {
    return prisma.order.findMany();
};
export const getOrderByUid = (uid) => {
    return prisma.order.findUnique({ where: { uid } });
};
export const createOrder = (data) => {
    return prisma.order.create({ data });
};
export const updateOrder = (uid, data) => {
    return prisma.order.update({ where: { uid }, data });
};
export const deleteOrder = (uid) => {
    return prisma.order.delete({ where: { uid } });
};
//# sourceMappingURL=order.service.js.map