import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // Ensure the correct path

function ManageOffers() {
  const [offers, setOffers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch offers from Supabase
    const fetchOffers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        setMessage('You must be logged in to manage offers.');
        return;
      }

      const { data, error } = await supabase
        .from('user_offer')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching offers:', error);
        setMessage('Error fetching offers.');
      } else {
        setOffers(data);
      }
    };

    fetchOffers();
  }, []);

  const handleDeleteOffer = async (id) => {
    const { error } = await supabase
      .from('user_offer')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage('Error deleting offer.');
      console.error('Error deleting offer:', error);
    } else {
      setOffers(offers.filter(offer => offer.id !== id));
      setMessage('Offer deleted successfully!');
    }
  };

  return (
    <div className="manage-offers-container">
      <h2>Manage Offers</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {offers.length === 0 ? (
        <p>No offers available.</p>
      ) : (
        <ul>
          {offers.map((offer) => (
            <li key={offer.id}>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <p>Points: {offer.points}</p>
              <button onClick={() => handleDeleteOffer(offer.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageOffers;
