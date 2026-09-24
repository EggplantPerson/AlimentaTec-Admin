import { prisma } from '../lib/prisma.js'
import { io } from '../server.js';

export const getAllProducts = () => {
    return prisma.product.findMany();
};

export const createProduct = async (data: {name:string; description:string; category: string; image_url:string; price:number; addons: string[]; }) => {
    const product = await prisma.product.create({ data });
    io.emit('product:created', product);
    return product;
};

export const updateProduct = async (id: number, data: Partial<{name:string; description:string; category: string; image_url:string; price:number; available: boolean; addons: string[]; }>) => {
    const product = await prisma.product.update({ where: { id }, data});
    io.emit('product:updated', product);
    return product;
};

export const deleteProduct = async (id: number) => {
    const product = await prisma.product.delete({where: { id } });
    io.emit('product:deleted', product);
    return product;
};