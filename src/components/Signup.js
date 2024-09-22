import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaArrowCircleLeft } from 'react-icons/fa';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else if (data.user) {
      setMessage('Signup successful! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 1500); // Redirect after a short delay
    }
  };

  return (
    <div className="bodystyle">
      <div className="signup">
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
        <h2>Create Your Account</h2>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Signup;
