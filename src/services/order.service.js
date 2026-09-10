const API_URL = '/api/orders';
export async function getOrders() {
    const res = await fetch(API_URL);
    if (!res.ok)
        throw new Error('Failed to fetch products');
    return res.json();
}
export async function getOrder(uid) {
    const res = await fetch(`${API_URL}/${uid}`);
    if (!res.ok)
        throw new Error('Failed to fetch product');
}
export async function createOrder(data) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok)
        throw new Error('Failed to create Order');
}
export async function updateOrder(uid, data) {
    const res = await fetch(`${API_URL}/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok)
        throw new Error('Failed to update order');
}
export async function deleteOrder(uid) {
    const res = await fetch(`${API_URL}/${uid}`, {
        method: 'DELETE'
    });
    if (!res.ok)
        throw new Error('Failed to delte order');
}
//# sourceMappingURL=order.service.js.map