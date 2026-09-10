const API_URL = '/api/products';
export async function getProducts() {
    const res = await fetch(API_URL);
    if (!res.ok)
        throw new Error('Failed to fetch products');
    return res.json();
}
export async function createProduct(data) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok)
        throw new Error('Failed to create product');
    return res.json();
}
export async function updateProduct(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok)
        throw new Error('Failed to update product');
    return res.json();
}
export async function deleteProduct(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok)
        throw new Error('Failed to delete product');
}
//# sourceMappingURL=product.service.js.map