'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Feil passord');
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Admin innlogging</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-wrapper">
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin passord"
          />
          <button
            type="button"
            className="show-password-btn"
            onClick={toggleShowPassword}
            aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type="submit">Logg inn</button>
      </form>
    </div>
  );
}
