'use client';
import { useEffect, useState } from 'react';

const ADMIN_PASSWORD = 'Maja_220623'; // 🔐 Ditt admin-passord

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminAccess');
    if (saved === 'true') setAuthorized(true);
    setReady(true);
  }, []);

  const handleLogin = () => {
    if (inputPassword === ADMIN_PASSWORD) {
      localStorage.setItem('adminAccess', 'true');
      setAuthorized(true);
    } else {
      alert('Feil passord');
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
        throw new Error(`Feil under opplasting: ${errorText}`);
      }

      const data = await res.json();
      setUrl(data.url);
      localStorage.setItem('lastUploadedUrl', data.url);
    } catch (err) {
      alert('Opplasting feilet: ' + err.message);
    }
  };

  if (!ready) return null;

  if (!authorized) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Logg inn som admin</h1>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="border px-3 py-2 rounded mb-4 w-full"
          placeholder="Skriv inn passord"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Logg inn
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Last opp bilde</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
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
