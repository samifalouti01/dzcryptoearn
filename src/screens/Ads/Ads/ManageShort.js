import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient'; // Adjust the path if necessary

function ManageAds() {
  const [ads, setAds] = useState([]);
  const [editAd, setEditAd] = useState(null); // State for managing ad edits
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [link, setLink] = useState('');
  const [points, setPoints] = useState(''); // New state for points
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch ads from Supabase
    const fetchAds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (userId) {
        const { data, error } = await supabase
          .from('user_ads')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching ads:', error);
        } else {
          setAds(data);
        }
      }
    };

    fetchAds();
  }, []);

  // Handle ad deletion
  const handleDeleteAd = async (id) => {
    const { error } = await supabase
      .from('user_ads')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage('Error deleting ad.');
      console.error('Error deleting ad:', error);
    } else {
      setAds(ads.filter(ad => ad.id !== id));
      setMessage('Ad deleted successfully!');
    }
  };

  // Load the selected ad's data into the form fields
  const handleEditClick = (ad) => {
    setEditAd(ad.id);
    setTitle(ad.title);
    setShortDescription(ad.short_description);
    setLink(ad.link);
    setPoints(ad.points); // Populate points field
  };

  // Handle ad editing
  const handleEditAd = async (id) => {
    if (!title || !shortDescription || !link || !points) {
      setMessage('Please provide title, short description, link, and points.');
      return;
    }

    const { error } = await supabase
      .from('user_ads')
      .update({ title, short_description: shortDescription, link, points: parseInt(points) })
      .eq('id', id);

    if (error) {
      setMessage('Error updating ad.');
      console.error('Error updating ad:', error);
    } else {
      setAds(ads.map(ad => (ad.id === id ? { ...ad, title, short_description: shortDescription, link, points: parseInt(points) } : ad)));
      setEditAd(null);
      setMessage('Ad updated successfully!');
    }
  };

  return (
    <div className="manage-ads-container">
      <h2>Manage Ads</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {ads.length === 0 ? (
        <p>No ads available.</p>
      ) : (
        <ul>
          {ads.map(ad => (
            <li key={ad.id}>
              {editAd === ad.id ? (
                <div>
                  <input
                    type="text"
                    value={title}
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    value={shortDescription}
                    placeholder="Short Description"
                    onChange={(e) => setShortDescription(e.target.value)}
                  ></textarea>
                  <input
                    type="text"
                    value={link}
                    placeholder="Link"
                    onChange={(e) => setLink(e.target.value)}
                  />
                  <input
                    type="number"
                    value={points}
                    placeholder="Points"
                    onChange={(e) => setPoints(e.target.value)}
                  />
                  <button onClick={() => handleEditAd(ad.id)}>Save</button>
                  <button onClick={() => setEditAd(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3>{ad.title}</h3>
                  <p>{ad.short_description}</p>
                  <p>{ad.link}</p>
                  <p>Points: {ad.points}</p>
                  <button onClick={() => handleEditClick(ad)}>Edit</button>
                  <button onClick={() => handleDeleteAd(ad.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageAds;
