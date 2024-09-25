import React, { useEffect, useState } from 'react';
import './Header.css'; 
import { supabase } from '../../supabaseClient'; 
import { useNavigate } from 'react-router-dom'; 
import { FaSignOutAlt } from 'react-icons/fa';

const Header = ({ title, updateHeaderPoints }) => {
  const [points, setPoints] = useState(0); // State to store points
  const navigate = useNavigate(); // Initialize navigate hook

  // Fetch user points
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const userId = user?.id;
        if (!userId) return;

        // Fetch total points
        const { data: userData, error: userDataError } = await supabase
          .from('total_points')
          .select('total_points')
          .eq('user_id', userId)
          .single();

        if (userDataError) throw userDataError;

        const totalPoints = userData?.total_points || 0;
        setPoints(totalPoints);
        updateHeaderPoints(totalPoints); // Call the function to update points

      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, [updateHeaderPoints]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('User logged out successfully');
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <header className="header">
      <div className="image">
        <img style={{ width: 'auto', height: '200px' }} src="/logo.svg" alt="logo" />
      </div>
      <div className="header-title">
        <h1>{title}</h1>
        <p>You have <strong>{points.toLocaleString()}</strong> points.</p>
      </div>
      <div className="header-actions">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
