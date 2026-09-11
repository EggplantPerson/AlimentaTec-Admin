import { prisma } from '../lib/prisma.js';
export const getAllProducts = () => {
    return prisma.product.findMany();
};
export const createProduct = (data) => {
    return prisma.product.create({ data });
};
export const updateProduct = (id, data) => {
    return prisma.product.update({ where: { id }, data });
};
export const deleteProduct = (id) => {
    return prisma.product.delete({ where: { id } });
};
