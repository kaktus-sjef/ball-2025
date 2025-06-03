'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs} from 'firebase/firestore';

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [,setUploadedUrls] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<{ id: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Hent alle bilder fra Firestore
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

  const uploadFiles = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('file', file));

    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: form,
        });

        const data = await res.json();
        if (res.ok) {
          setUploadedUrls((prev) => [...prev, data.url]);
          setAllImages((prev) => [...prev, { url: data.url, id: 'midlertidig' }]);
        } else {
          console.error(data.error);
        }
      }
    } finally {
      setUploading(false);
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
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />
      <button
        onClick={uploadFiles}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? 'Laster opp...' : 'Last opp'}
      </button>

      <h2 className="text-lg mt-6 mb-2">Alle bilder:</h2>
      <ul className="space-y-4">
        {allImages.map(({ id, url }) => (
          <li key={url} className="flex items-center gap-4 bg-[#111] p-2 rounded shadow">
            <img src={url} alt="preview" className="w-12 h-12 object-cover rounded" style={{ maxWidth: '100px', maxHeight: '100px' }}/>
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
