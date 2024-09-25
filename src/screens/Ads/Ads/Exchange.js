import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const Exchange = ({ availablePoints, updateHeaderPoints }) => {
  const [points, setPoints] = useState(availablePoints); // Initialize with availablePoints
  const [userId, setUserId] = useState(null); // User ID from Supabase
  const [exchangedPoints, setExchangedPoints] = useState(0); // Total exchanged points
  const [inputPoints, setInputPoints] = useState(0); // Points entered by user

  // Fetch user ID, points, and exchanged points from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) return;

      setUserId(userId);

      // Fetch total points and exchanged points
      const { data: userData, error: userError } = await supabase
        .from('total_points')
        .select('total_points, exchanged_points')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      const totalPoints = userData?.total_points || 0;
      const totalExchangedPoints = userData?.exchanged_points || 0;
      setPoints(totalPoints); // Update local points
      setExchangedPoints(totalExchangedPoints); // Update local exchanged points
    };

    fetchUserData();
  }, []);

  // Handle point exchange
  const handleExchange = async () => {
    if (points >= inputPoints && inputPoints > 0) {
      const updatedPoints = points - inputPoints; // Subtract exchanged points
      const updatedExchangedPoints = exchangedPoints + inputPoints; // Add to exchanged points

      // Update points and exchanged points in Supabase
      const { error } = await supabase
        .from('total_points')
        .update({ total_points: updatedPoints, exchanged_points: updatedExchangedPoints })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating points:', error);
      } else {
        setPoints(updatedPoints); // Update local points
        setExchangedPoints(updatedExchangedPoints); // Update local exchanged points

        // Update the header points
        if (typeof updateHeaderPoints === 'function') {
          updateHeaderPoints(updatedPoints);
        } else {
          console.error('updateHeaderPoints is not a function');
        }
      }
    } else {
      console.log('Not enough points to exchange.');
    }
  };

  return (
    <div className="exchange-container">
      <h2>Exchange Points</h2>
      <p>Available Points: {points}</p>
      <input
        type="number"
        value={inputPoints}
        onChange={(e) => setInputPoints(Number(e.target.value))}
        placeholder="Enter points to exchange"
      />
      <button 
        onClick={handleExchange} 
        disabled={inputPoints <= 0 || inputPoints > points}
      >
        Exchange Points
      </button>
      <p>Total Exchanged Points: {exchangedPoints}</p>
    </div>
  );
};

export default Exchange;
