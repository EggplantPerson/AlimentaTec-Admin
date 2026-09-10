const API_URL = '/api/products';

export async function getProducts() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function createProduct(data: {name:string; description:string; category: string; image_url:string; price:number; }) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
}

export async function updateProduct(id: number, data: Partial<{name:string; description:string; image_url:string; price:number; available: boolean}>) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
}

export async function deleteProduct(id: number) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
}