'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { uploadImagePair } from '@/lib/upload';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [allImages, setAllImages] = useState<{ id: string; url: string }[]>([]);

  // Hent alle bilder ved lasting
  useEffect(() => {
    const fetchImages = async () => {
      const snapshot = await getDocs(collection(db, 'images'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url,
      }));
      setAllImages(data);
    };
    fetchImages();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        try {
          const result = await uploadImagePair(file);
          console.log('Lastet opp:', result);

          setAllImages(prev => [
            ...prev,
            { url: result.previewUrl, id: 'midlertidig-' + Math.random().toString() },
          ]);
        } catch (err) {
          console.error('Feil med fil:', file.name, err);
        }
      }
    } finally {
      setUploading(false);
      // Nullstill inputfeltet slik at samme fil kan velges på nytt om ønskelig
      e.target.value = '';
    }
  };

  const deleteImage = async (url: string, id: string) => {
    const res = await fetch('/api/delete-image', {
      method: 'POST',
      body: JSON.stringify({ url, id }),
    });

    if (res.ok) {
      setAllImages(prev => prev.filter(img => img.id !== id));
    } else {
      const err = await res.json();
      alert('Feil ved sletting: ' + err.error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Adminpanel – Bildeopplasting</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {uploading && <p className="text-yellow-400 mb-4">Laster opp bilder...</p>}

      <h2 className="text-lg mt-6 mb-2">Alle bilder:</h2>
      <ul className="space-y-4">
        {allImages.map(({ id, url }) => (
            <li key={id} className="flex items-center gap-4 bg-[#111] p-2 rounded shadow">
            <img
              src={url}
              alt="preview"
              className="w-12 h-12 object-cover rounded"
              style={{ maxWidth: '100px', maxHeight: '100px' }}
            />
            <a href={url} target="_blank" className="text-blue-400 break-all">{url}</a>
            <button onClick={() => deleteImage(url, id)} className="text-red-500 font-bold ml-auto">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
