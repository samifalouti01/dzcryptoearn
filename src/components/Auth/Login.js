import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaArrowCircleLeft } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else if (data.session) {
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/main/dashboard'); // Navigate to dashboard after successful login
      }, 1500);
    }
  };

  return (
    <div className="bodystyle">
      <div className="login">
      <div className="top-left" >
          <div 
            style={{ cursor: 'pointer', fontSize: '2em' }} 
            onClick={() => navigate(-1)}
          >
            <FaArrowCircleLeft />
          </div>
          <div className="img">
          <img src='logo.svg' alt="logo" className="signup-logo" />
          </div>
        </div>
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        {message && <p className={`message ${message.includes('successful') ? 'success' : ''}`}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
