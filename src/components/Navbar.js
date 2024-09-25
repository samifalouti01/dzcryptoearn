import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import { FaTachometerAlt, FaLink, FaMoneyBillWave, FaWallet, FaBullhorn, FaTags, FaPlayCircle, FaFileAlt, FaClipboardList } from 'react-icons/fa'; // Import icons

const Navbar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink 
            to="/main/dashboard" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaTachometerAlt /> <span className="nav-text">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/links" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaLink /> <span className="nav-text">Short Links</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/offers" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaTags /> <span className="nav-text">Offers</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/watchads" // New route for Watch Ads
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaPlayCircle /> <span className="nav-text">Watch Ads</span> 
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/withdrawal" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaMoneyBillWave /> <span className="nav-text">Withdrawal</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/deposit" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaWallet /> <span className="nav-text">Deposit</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/ads" 
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaBullhorn /> <span className="nav-text">Ads Management</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/report" // New route for Report
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaClipboardList /> <span className="nav-text">Report</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/main/documents" // New route for Documents
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FaFileAlt /> <span className="nav-text">Documents</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
