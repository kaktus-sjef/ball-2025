'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/login.css'; 

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      localStorage.setItem('mainAuthorized', 'true');
      router.push('/main_page');
    } else {
      setError('Feil passord');
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Skriv inn passord for å få tilgang</h2>
        <input className="input"
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Logg inn</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
