import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();

router.get('/presign', uploadController.getUploadUrl);

export default router;