import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import './Checker.css';

const Checker = ({ children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      // Check if user is in total_points table
      const { data: totalPointsData, error: totalPointsError } = await supabase
        .from('total_points')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (totalPointsError) {
        console.error('Error checking total points:', totalPointsError);
        setLoading(false);
        return;
      }

      if (!totalPointsData) {
        // User is not in total_points table, add them
        const { error: insertError } = await supabase
          .from('total_points')
          .insert([{
            user_id: userId,
            total_points: 0,
            exchanged_points: 0,
            updated_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Error inserting into total_points:', insertError.message);
          setLoading(false);
          return;
        }

        // Show popup
        setShowPopup(true);
      }

      setLoading(false);
    };

    checkUserPoints();
  }, []); // Empty dependency array to run only on mount

  const handleStartEarning = () => {
    navigate('/main/dashboard'); // Redirect to dashboard
    setShowPopup(false);
  };

  if (loading) return <ClipLoader className="loader" color={"#123abc"} loading={loading} size={150} />;

  return (
    <div>
      {children}

      {/* Popup for new users */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Welcome to the Dashboard!</h2>
            <p>It looks like you are new here. Start earning points by clicking the button below.</p>
            <button onClick={handleStartEarning}>Start Earning</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checker;
