export declare const getAllOrders: () => import("../../../generated/prisma/internal/prismaNamespace.js").PrismaPromise<{
    products: string[];
    id: number;
    status: string;
    uid: string;
    total: number;
    orderTime: Date;
}[]>;
export declare const getOrderByUid: (uid: string) => import("../../../generated/prisma/models.js").Prisma__OrderClient<{
    products: string[];
    id: number;
    status: string;
    uid: string;
    total: number;
    orderTime: Date;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
export declare const createOrder: (data: {
    uid: string;
    id: number;
    products: string[];
    total: number;
}) => import("../../../generated/prisma/models.js").Prisma__OrderClient<{
    products: string[];
    id: number;
    status: string;
    uid: string;
    total: number;
    orderTime: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
export declare const updateOrder: (uid: string, data: Partial<{
    products: string[];
    status: string;
    total: number;
}>) => import("../../../generated/prisma/models.js").Prisma__OrderClient<{
    products: string[];
    id: number;
    status: string;
    uid: string;
    total: number;
    orderTime: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
export declare const deleteOrder: (uid: string) => import("../../../generated/prisma/models.js").Prisma__OrderClient<{
    products: string[];
    id: number;
    status: string;
    uid: string;
    total: number;
    orderTime: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("../../../generated/prisma/internal/prismaNamespace.js").GlobalOmitConfig | undefined;
}>;
//# sourceMappingURL=order.service.d.ts.map