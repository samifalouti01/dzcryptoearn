import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Main from './components/Main';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Links from './components/Links';
import Withdrawal from './components/Withdrawal';
import Deposit from './components/Deposit';
import Ads from './components/Ads';
import Offers from './components/Offers';
import WatchAds from './components/WatchAds';
import ParentComponent from './components/ParentComponent'; 
import { supabase } from './supabaseClient';
import Checker from './components/Checker';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(data.session !== null);
    };

    // Check initial authentication status
    checkAuth();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(session !== null);
    });

    // Cleanup listener on component unmount
    return () => {
      if (authListener && typeof authListener === 'object' && 'unsubscribe' in authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/main/dashboard" /> : <Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Checker><Login /></Checker>} />
          <Route path="/main" element={isAuthenticated ? <Main /> : <Navigate to="/" />} >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Checker><Dashboard /></Checker>} />
            <Route path="links" element={<Links />} />
            <Route path="withdrawal" element={<Withdrawal />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="ads" element={<Ads />} />
            <Route path="offers" element={<Offers />} />
            <Route path="watchads" element={<WatchAds />} />
            <Route path="parent" element={<ParentComponent />} /> 
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
