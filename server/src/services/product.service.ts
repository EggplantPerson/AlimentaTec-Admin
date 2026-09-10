import { prisma } from '../lib/prisma.js'

export const getAllProducts = () => {
    return prisma.product.findMany();
};

export const createProduct = (data: {name:string; description:string; category: string; image_url:string; price:number; }) => {
    return prisma.product.create({ data });
};

export const updateProduct = (id: number, data: Partial<{name:string; description:string; category: string; image_url:string; price:number; available: boolean}>) => {
    return prisma.product.update({ where: { id }, data});
};

export const deleteProduct = (id: number) => {
    return prisma.product.delete({where: { id } });
};