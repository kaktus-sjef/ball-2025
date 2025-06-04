import imageCompression from 'browser-image-compression';

export async function uploadImagePair(file: File) {
  // 1. Komprimer preview
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
  });

  // 2. Lag FormData med original + preview
  const formData = new FormData();
  formData.append('original', file);
  formData.append('preview', compressedFile);

  // 3. Send til backend
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Feil ved opplasting');

  return await res.json(); // { previewUrl, originalUrl }
}
