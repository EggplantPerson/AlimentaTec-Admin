import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../../generated/prisma/client.js';
import * as productService from '../services/product.service.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products)
    } catch (err) {
        next(err);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.updateProduct(Number(req.params.id), req.body);
        res.json(product);
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found'});
        }
        next(err);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productService.deleteProduct(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found'});
        };
        next(err);
    }
};