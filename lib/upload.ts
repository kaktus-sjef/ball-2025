import imageCompression from 'browser-image-compression';

export async function uploadImagePair(file: File) {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
  });

  const formData = new FormData();
  formData.append('original', file);
  formData.append('preview', compressedFile);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  

  if (!res.ok) throw new Error('Feil ved opplasting');

  return await res.json(); // { previewUrl, originalUrl }
}
