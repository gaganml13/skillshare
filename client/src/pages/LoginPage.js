
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(name, email, password);
    if (res.success) {
      setIsRegister(false);
      setName('');
      setEmail('');
      setPassword('');
      setError('Registration successful! Please log in.');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, boxShadow: '0 2px 8px #eee', borderRadius: 8 }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegister ? handleRegister : handleLogin}>
        {isRegister && (
          <div style={{ marginBottom: 16 }}>
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: isRegister && error.startsWith('Registration successful') ? 'green' : 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 4 }}>{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <label style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isRegister}
            onChange={() => setIsRegister(!isRegister)}
            style={{ marginRight: 8 }}
          />
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </label>
      </div>
    </div>
  );
};

export default LoginPage;
