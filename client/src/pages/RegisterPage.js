import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle registration form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(name, email, password);
    if (res.success) {
      navigate('/login');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, boxShadow: '0 2px 8px #eee', borderRadius: 8 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: 10, background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 4 }}>Register</button>
          <a href="/login" style={{ flex: 1, padding: 10, background: '#fff', color: '#6C63FF', border: '1px solid #6C63FF', borderRadius: 4, textAlign: 'center', textDecoration: 'none', lineHeight: '36px' }}>Login</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
