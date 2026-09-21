const API_URL = `${import.meta.env.VITE_API_URL}/uploads`;

export async function uploadImage(file: File): Promise<{ key: string; publicUrl: string}> {
    const extension = file.name.split('.').pop() ?? 'jpg';

    //Obtener url desde backend
    const presignRes = await fetch(
        `${API_URL}/presign?extension=${extension}&contentType=${encodeURIComponent(file.type)}`
    );
    if (!presignRes.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, key, publicUrl } = await presignRes.json();

    //Subir bytes del archivo directo al bucket
    const uploadRes = await fetch(uploadUrl, {
        method:'PUT',
        headers: { 'Content-Type': file.type},
        body: file,
    });
    if (!uploadRes.ok) throw new Error('Failed to upload file');

    return { key, publicUrl };
}