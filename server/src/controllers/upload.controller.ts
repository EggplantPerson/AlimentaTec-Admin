import type { Request, Response, NextFunction } from 'express';
import * as uploadService from '../services/upload.service.js';

export const getUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { extension, contentType } = req.query;
        const result = await uploadService.getPresignedUploadUrl(
            String(extension),
            String(contentType)
        );
        res.json(result);
    } catch (err) {
        next(err)
    }
};