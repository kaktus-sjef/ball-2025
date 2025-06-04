'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminPage() {
  const [allImages, setAllImages] = useState<{ id: string; url: string; originalUrl: string }[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const snapshot = await getDocs(collection(db, 'images'));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      url: doc.data().previewUrl, // <--- Bytter navn her
      originalUrl: doc.data().originalUrl
    }));    
    setAllImages(data);
  };
  

  const syncImages = async () => {
    setSyncing(true);
    setStatus(null);

    try {
      const res = await fetch('/api/sync-new-images', {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Synkronisering fullført!');
        await fetchImages();
      } else {
        setStatus('Feil: ' + (data.error || 'Ukjent feil'));
      }
    } catch (err) {
      console.error(err);
      setStatus('Klarte ikke å kontakte serveren.');
    } finally {
      setSyncing(false);
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
      <h1 className="text-2xl font-bold mb-4">Adminpanel – Bilder</h1>

      <button
        onClick={syncImages}
        disabled={syncing}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      >
        {syncing ? 'Synkroniserer...' : 'Synkroniser nye bilder'}
      </button>

      {status && (
        <p className="mt-2 text-sm" style={{ color: status.includes('fullført') ? 'lime' : 'red' }}>
          {status}
        </p>
      )}

      <h2 className="text-lg mt-6 mb-2">Alle bilder:</h2>
      <ul className="space-y-4">
        {allImages.map(({ id, url, originalUrl }) => (
          <li key={id} className="flex items-center gap-4 bg-[#111] p-2 rounded shadow">
            <img
              src={url}
              alt="preview"
              className="w-12 h-12 object-cover rounded"
              style={{ maxWidth: '100px', maxHeight: '100px' }}
            />
            <div className="flex flex-col">
              <a href={url} target="_blank" className="text-blue-400 break-all">Preview</a>
              <a href={originalUrl} target="_blank" className="text-green-400 break-all">Original</a>
            </div>
            <button onClick={() => deleteImage(url, id)} className="text-red-500 font-bold ml-auto">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
