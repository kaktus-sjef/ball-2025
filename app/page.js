'use client';
import { useEffect, useState } from 'react';

export default function MainPage() {
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  const CORRECT_PASSWORD = 'ball2025';

  useEffect(() => {
    const saved = localStorage.getItem('mainAuthorized');
    if (saved === 'true') setAuthorized(true);
  }, []);

  const handleLogin = () => {
    if (inputPassword === CORRECT_PASSWORD) {
      localStorage.setItem('mainAuthorized', 'true');
      setAuthorized(true);
    } else {
      alert('Feil passord!');
    }
  };

  if (!authorized) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Skriv inn passord for å se galleriet</h1>
        <input
          type="password"
          className="border p-2 rounded"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Logg inn
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🎉 Galleriet</h1>
      {/* Her kommer galleriet ditt med bilder fra Firestore eller opplasting */}
      <p>Her vises bildene etter opplasting</p>
    </div>
  );
}
