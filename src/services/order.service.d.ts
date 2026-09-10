export declare function getOrders(): Promise<any>;
export declare function getOrder(uid: string): Promise<void>;
export declare function createOrder(data: {
    uid: string;
    id: number;
    products: string[];
    total: number;
}): Promise<void>;
export declare function updateOrder(uid: string, data: Partial<{
    products: string[];
    status: string;
    total: number;
}>): Promise<void>;
export declare function deleteOrder(uid: string): Promise<void>;
//# sourceMappingURL=order.service.d.ts.map