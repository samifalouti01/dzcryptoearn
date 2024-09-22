import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Ensure the correct path to Supabase client

function CreateOffer() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // Points the user will spend to create the offer
  const [users, setUsers] = useState('');   // Number of users who will receive the offer
  const [pointsPerUser, setPointsPerUser] = useState(''); // Points each user will earn from the offer
  const [message, setMessage] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [minPoints] = useState(10); // Minimum points allowed

  // Fetch user points from Supabase
  useEffect(() => {
    const fetchUserPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (userId) {
        const { data: userData, error: userError } = await supabase
          .from('total_points')
          .select('exchanged_points')
          .eq('user_id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user points:', userError);
        } else {
          setUserPoints(userData?.exchanged_points || 0);
        }
      }
    };

    fetchUserPoints();
  }, []);

  // Handle amount change and calculate points per user
  const handleAmountChange = (e) => {
    const amountValue = e.target.value;
    setAmount(amountValue);
    
    if (users) {
      const pointsPerUserValue = (parseInt(amountValue, 10) / parseInt(users, 10)).toFixed(2);
      setPointsPerUser(pointsPerUserValue);
    }
  };

  // Handle users change and recalculate points per user
  const handleUsersChange = (e) => {
    const usersValue = e.target.value;
    setUsers(usersValue);

    if (amount) {
      const pointsPerUserValue = (parseInt(amount, 10) / parseInt(usersValue, 10)).toFixed(2);
      setPointsPerUser(pointsPerUserValue);
    }
  };

  // Handle offer creation
  const handleCreateOffer = async () => {
    const amountValue = parseInt(amount, 10);
    const usersValue = parseInt(users, 10);
    const pointsPerUserValue = parseFloat(pointsPerUser);

    // Validate inputs
    if (isNaN(amountValue) || amountValue < minPoints) {
      setMessage(`Please enter a valid amount (minimum ${minPoints}).`);
      return;
    }

    if (isNaN(usersValue) || usersValue <= 0) {
      setMessage('Please enter a valid number of users.');
      return;
    }

    if (pointsPerUserValue <= 0) {
      setMessage('Points per user must be greater than zero.');
      return;
    }

    if (amountValue > userPoints) {
      setMessage('You don\'t have enough points to create this offer.');
      return;
    }

    if (title && description) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        setMessage('User not authenticated.');
        return;
      }

      // Create the offer and deduct points
      const { error: offerError } = await supabase
        .from('user_offer')
        .insert([{ title, description, amount: amountValue, users: usersValue, points: pointsPerUserValue, user_id: userId }]);

      if (offerError) {
        console.error('Error creating offer:', offerError.message);
        setMessage(`Error creating offer: ${offerError.message}`);
        return;
      }

      // Deduct points from user's exchanged_points
      const { error: pointsError } = await supabase
        .from('total_points')
        .update({ exchanged_points: userPoints - amountValue })
        .eq('user_id', userId);

      if (pointsError) {
        console.error('Error updating points:', pointsError.message);
        setMessage(`Error updating points: ${pointsError.message}`);
        return;
      }

      setMessage('Offer created successfully!');
      setTitle('');
      setDescription('');
      setAmount('');
      setUsers('');
      setPointsPerUser('');
      setUserPoints(prevPoints => prevPoints - amountValue);
    } else {
      setMessage('Please provide a title and description.');
    }
  };

  return (
    <div className="create-ad-container">
      <h2>Create Offer</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <input
        type="text"
        placeholder="Offer Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Offer Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="number"
        placeholder="Amount Points (Total Points to Spend)"
        value={amount}
        onChange={handleAmountChange}
        min={minPoints} // Ensure points can't go below 10
      />
      <input
        type="number"
        placeholder="Users (Number of Users Receiving the Offer)"
        value={users}
        onChange={handleUsersChange}
        min={1} // Ensure users can't go below 1
      />
      <input
        type="number"
        placeholder="Points Per User (Auto-calculated)"
        value={pointsPerUser}
        readOnly
      />
      <button onClick={handleCreateOffer}>Create Offer</button>
    </div>
  );
}

export default CreateOffer;
