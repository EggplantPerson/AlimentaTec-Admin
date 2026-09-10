export declare const getAllProducts: () => import("../../../generated/prisma/internal/prismaNamespace.js").PrismaPromise<{
    name: string;
    description: string;
    image_url: string;
    price: number;
    id: number;
    category: string;
    available: boolean;
}[]>;
export declare const createProduct: (data: {
    name: string;
    description: string;
    category: string;
    image_url: string;
    price: number;
}) => import("../../../generated/prisma/models.js").Prisma__ProductClient<{
    name: string;
    description: string;
    image_url: string;
    price: number;
    id: number;
    category: string;
    available: boolean;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
export declare const updateProduct: (id: number, data: Partial<{
    name: string;
    description: string;
    image_url: string;
    price: number;
}>) => import("../../../generated/prisma/models.js").Prisma__ProductClient<{
    name: string;
    description: string;
    image_url: string;
    price: number;
    id: number;
    category: string;
    available: boolean;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
export declare const deleteProduct: (id: number) => import("../../../generated/prisma/models.js").Prisma__ProductClient<{
    name: string;
    description: string;
    image_url: string;
    price: number;
    id: number;
    category: string;
    available: boolean;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
//# sourceMappingURL=product.service.d.ts.map