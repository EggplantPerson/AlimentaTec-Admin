import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../../generated/prisma/client.js';
import * as storeStateService from '../services/storeState.service.js'

export const getStoreState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeState = await storeStateService.getStoreState();
        res.json(storeState);
    } catch (err) {
        next(err);
    }
};

export const updateStoreState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeState = await storeStateService.updateStoreState(Number(req.params.id), req.body);
        res.json(storeState)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ error: 'storeState not found'});
        }
        next(err);
    }
};