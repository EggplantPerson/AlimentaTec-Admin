const API_URL = `${import.meta.env.VITE_API_URL}/orders`;

export async function getOrders() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function getOrder(uid: string) {
    const res = await fetch(`${API_URL}/${uid}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
}

export async function createOrder(data: {uid: string; id: number; products: string[]; total: number}) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Order');
    return res.json();
}

export async function updateOrder(uid: string, data: Partial<{ products: string[]; status: string; total: number }>) {
    const res = await fetch(`${API_URL}/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
}

export async function deleteOrder(uid: string) {
    const res = await fetch(`${API_URL}/${uid}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delte order')
}