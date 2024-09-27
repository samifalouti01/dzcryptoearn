import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // Adjust the path if necessary

function CreateAds() {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [link, setLink] = useState('');
  const [amountPoints, setAmountPoints] = useState(''); // Total points to spend
  const [users, setUsers] = useState(''); // Number of users
  const [pointsPerUser, setPointsPerUser] = useState(''); // Points each user will earn
  const [message, setMessage] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [minPointsPerUser] = useState(1000); // Minimum points per user

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

  // Automatically calculate points per user
  useEffect(() => {
    const amount = parseInt(amountPoints, 10);
    const userCount = parseInt(users, 10);

    if (!isNaN(amount) && !isNaN(userCount) && userCount > 0) {
      const calculatedPointsPerUser = Math.floor(amount / userCount);
      setPointsPerUser(calculatedPointsPerUser);
    } else {
      setPointsPerUser('');
    }
  }, [amountPoints, users]);

  // Handle ad creation
  const handleCreateAd = async () => {
    const pointsToSpend = parseInt(amountPoints, 10);
    const userCount = parseInt(users, 10);
    const calculatedPointsPerUser = pointsPerUser;

    if (isNaN(pointsToSpend) || pointsToSpend <= 0) {
      setMessage('Please enter a valid amount of points.');
      return;
    }

    if (pointsToSpend > userPoints) {
      setMessage('You don\'t have enough points to create this ad.');
      return;
    }

    if (userCount <= 0 || isNaN(userCount)) {
      setMessage('Please enter a valid number of users.');
      return;
    }

    if (calculatedPointsPerUser < minPointsPerUser) {
      setMessage(`Error: Each user must receive at least ${minPointsPerUser} points. Currently, each user would receive ${calculatedPointsPerUser} points.`);
      return;
    }

    if (title && shortDescription && link && pointsPerUser) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        setMessage('User not authenticated.');
        return;
      }

      // Start a transaction to create the ad and deduct points
      const { error: adError } = await supabase
        .from('user_websites')
        .insert([{
          user_id: userId,
          title,
          short_description: shortDescription,
          link,
          amount: pointsToSpend,
          users: userCount,
          points: pointsPerUser
        }]);

      if (adError) {
        console.error('Error creating ad:', adError.message);
        setMessage(`Error creating ad: ${adError.message}`);
        return;
      }

      // Deduct points from user's exchanged_points
      const totalPointsToDeduct = Math.floor(pointsPerUser * userCount);

      const { error: pointsError } = await supabase
        .from('total_points')
        .update({ exchanged_points: userPoints - totalPointsToDeduct })
        .eq('user_id', userId);

      if (pointsError) {
        console.error('Error updating points:', pointsError.message);
        setMessage(`Error updating points: ${pointsError.message}`);
        return;
      }

      setMessage('Ad created successfully!');
      // Reset form fields after successful ad creation
      setTitle('');
      setShortDescription('');
      setLink('');
      setAmountPoints('');
      setUsers('');
      setPointsPerUser('');
      // Update userPoints state to reflect the deduction
      setUserPoints(prevPoints => prevPoints - totalPointsToDeduct);
    } else {
      setMessage('Please provide all required fields.');
    }
  };

  return (
    <div className="create-ad-container">
      <h2>Create Ad</h2>
      <div>
        <input
          type="text"
          placeholder="Ad Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
      <textarea
        placeholder="Short Description"
        value={shortDescription}
        onChange={(e) => {
          if (e.target.value.length <= 20) {
            setShortDescription(e.target.value);
          }
        }}
      ></textarea>
      </div>
      <div>
        <input
          type="text"
          placeholder="Ad Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Amount Points to Spend"
          value={amountPoints}
          onChange={(e) => setAmountPoints(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Number of Users"
          value={users}
          onChange={(e) => setUsers(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Points per User"
          value={pointsPerUser}
          readOnly
        />
        <p>The points per user are automatically calculated based on the amount and users.</p>
      </div>
      <button onClick={handleCreateAd}>Create Ad</button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default CreateAds;
