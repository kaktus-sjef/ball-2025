'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminPage() {
  const [allImages, setAllImages] = useState<{ id: string; url: string; originalUrl: string; sortNumber: number; filename: string }[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const snapshot = await getDocs(collection(db, 'images'));
    const data = snapshot.docs.map(doc => {
      const previewUrl = doc.data().previewUrl;
      const originalUrl = doc.data().originalUrl;

      const match = originalUrl?.match(/MG_(\d+)\./);
      const sortNumber = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
      const filename = match ? `MG_${match[1]}` : 'Ukjent';

      return {
        id: doc.id,
        url: previewUrl,
        originalUrl,
        sortNumber,
        filename
      };
    });

    const sorted = data
      .filter(d => d.url && d.originalUrl)
      .sort((a, b) => a.sortNumber - b.sortNumber);

    setAllImages(sorted);
  };

  const syncImages = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const res = await fetch('/api/sync-new-images', { method: 'POST' });
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
    <div className="p-6 max-w-6xl mx-auto text-white">
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

      <h2 className="text-lg mt-6 mb-2">
        Alle bilder: <span className="text-yellow-400">{allImages.length}</span>
      </h2>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-600 text-sm text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 border border-gray-600">Preview</th>
              <th className="px-4 py-2 border border-gray-600">Filnavn</th>
              <th className="px-4 py-2 border border-gray-600">Lenker</th>
              <th className="px-4 py-2 border border-gray-600">Slett</th>
            </tr>
          </thead>
          <tbody>
            {allImages.map(({ id, url, originalUrl, filename }) => (
              <tr key={id} className="bg-gray-900 hover:bg-gray-800">
                <td className="px-4 py-2 border border-gray-600">
                  <img
                    src={url}
                    alt="preview"
                    className="rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </td>
                <td className="px-4 py-2 border border-gray-600 text-white">{filename}</td>
                <td className="px-4 py-2 border border-gray-600">
                  <div className="flex flex-col break-all">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400">Preview</a>
                    <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 mt-1">Original</a>
                  </div>
                </td>
                <td className="px-4 py-2 border border-gray-600 text-center">
                  <button
                    onClick={() => deleteImage(url, id)}
                    className="text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
