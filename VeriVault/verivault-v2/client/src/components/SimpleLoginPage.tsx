import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SimpleLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              V
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>VeriVault</h1>
              <p style={{ fontSize: '14px', color: '#06b6d4', margin: 0 }}>Security Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
            Sign In
          </h2>

          {error && (
            <div className="text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Demo credentials: admin / password
            </p>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage; 