const API_URL = `${import.meta.env.VITE_API_URL}/storeState`;

export async function getStoreState() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch store state');
    return res.json();
};

export async function updateStoreState(data: { isOpen: boolean }) {
    const res = await fetch(`${API_URL}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update store state');
    return res.json();
}