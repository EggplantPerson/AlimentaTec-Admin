export declare function getProducts(): Promise<any>;
export declare function createProduct(data: {
    name: string;
    description: string;
    category: string;
    image_url: string;
    price: number;
}): Promise<any>;
export declare function updateProduct(id: number, data: Partial<{
    name: string;
    description: string;
    image_url: string;
    price: number;
}>): Promise<any>;
export declare function deleteProduct(id: number): Promise<void>;
//# sourceMappingURL=product.service.d.ts.map