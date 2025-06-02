'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(
    typeof document !== 'undefined' && document.cookie.includes('admin_password=')
  );

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        document.cookie = `admin_password=${password}; path=/`;
        setAuthorized(true);
        setError('');
      } else {
        setError('Feil passord');
      }
    } catch (err) {
      setError('Nettverksfeil eller serverfeil');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      setUrl(data.url);
      localStorage.setItem('lastUploadedUrl', data.url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Opplasting feilet: ' + err.message);
      } else {
        alert('En ukjent feil oppstod under opplasting.');
      }
    }
  };

  if (!authorized) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Logg inn som admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded mb-4 w-full"
          placeholder="Skriv inn passord"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Logg inn
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Last opp bilde</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <br />
      <button
        onClick={uploadFile}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Last opp
      </button>

      {url && (
        <div className="mt-6">
          <p className="mb-2">Bildet ble lastet opp:</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {url}
          </a>
          <br />
          <img src={url} alt="Lastet opp" className="max-w-md mt-4 rounded shadow" />
        </div>
      )}
    </div>
  );
}
