import type { Request, Response, NextFunction } from 'express';
export declare const getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderByUid: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrder: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteOrder: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=order.controller.d.ts.map