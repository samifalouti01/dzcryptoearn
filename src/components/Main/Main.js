import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Navbar from '../Navbar';
import './Main.css';

const Main = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/signup' && location.pathname !== '/login' && location.pathname !== '/';

  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout logic here
  };

  return (
    <div className="main">
      <Header onLogout={handleLogout} />
      <div className="main-content">
        {showNavbar && <Navbar />}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Main;
