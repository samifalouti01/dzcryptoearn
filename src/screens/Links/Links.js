import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Links.css';
import { FaExternalLinkAlt, FaCheckCircle, FaCopy } from 'react-icons/fa';

function Links({ updateHeaderPoints }) {
  const [cards, setCards] = useState([]);
  const [claimingCardId, setClaimingCardId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); 

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUserId(user?.id || null);
    };

    fetchUser();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (!userId) return;
  
      // Fetch all ads
      const { data: ads, error: adsError } = await supabase
        .from('user_ads')
        .select('*');
  
      if (adsError) {
        console.error('Error fetching ads:', adsError);
        return;
      }
  
      // Fetch clicked cards for the current user
      const { data: clickedCards, error: clickError } = await supabase
        .from('user_click')
        .select('card_id')
        .eq('user_id', userId);
  
      if (clickError) {
        console.error('Error fetching user clicks:', clickError);
        return;
      }
  
      const clickedCardIds = new Set(clickedCards.map(click => click.card_id.toString()));
  
      // Filter out ads that have been clicked by the current user
      const filteredAds = ads.filter(ad => !clickedCardIds.has(ad.id.toString()));
  
      setCards(filteredAds);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTake = (cardId, link) => {
    const newWindow = window.open(link, '_blank');
    
    if (!newWindow) {
      alert('Please enable pop-ups for this site.');
      return;
    }
    
    // Start claiming process
    setClaimingCardId(cardId);
    setTimer(15);
    
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          
          // Complete the claim
          setClaimingCardId(null);
          setShowSuccess(true);
    
          // Update the number of users left for the ad
          decrementUsers(cardId);
    
          // Record the user click with cardId once
          recordUserClick(userId, cardId, link);
    
          // Refresh the cards after a successful claim
          setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // If the user closes the popup before the interval completes
    newWindow.onbeforeunload = () => {
      clearInterval(intervalId);
      setClaimingCardId(null);
    };
  };

  const recordUserClick = async (userId, cardId, link) => {
    try {
      // Check if the user has already clicked this card
      const { data: existingClicks, error: checkError } = await supabase
        .from('user_click')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId);
  
      if (checkError) {
        console.error('Error checking existing clicks:', checkError);
        return;
      }
  
      if (existingClicks.length > 0) {
        console.log('Click already recorded.');
        return;
      }      
  
      // Fetch the points for the clicked card
      const { data: cardData, error: cardError } = await supabase
        .from('user_ads')
        .select('points')
        .eq('id', cardId)
        .single();
  
      if (cardError) {
        console.error('Error fetching card data:', cardError);
        return;
      }
  
      const points = cardData?.points || 0;
  
      // Insert the new click record
      const { error: insertError } = await supabase
        .from('user_click')
        .insert([{ user_id: userId, card_id: cardId, links: link }]);
  
      if (insertError) {
        console.error('Error recording user click:', insertError);
        return;
      }
  
      console.log('Click recorded successfully');
  
      // Update total points
      updateTotalPoints(userId, points);
    } catch (error) {
      console.error('Error in recordUserClick:', error);
    }
  };

  const updateTotalPoints = async (userId, points) => {
    console.log('Updating points for user:', userId);
    
    try {
      const { data: userData, error: fetchUserError } = await supabase
        .from('total_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();
  
      if (fetchUserError) {
        console.error('Error fetching user data:', fetchUserError);
        return;
      }
  
      const currentPoints = Number(userData?.total_points) || 0;
      console.log('Current points before update:', currentPoints);
  
      const newPoints = Number(points); // Ensure points is a number
      const newTotalPoints = currentPoints + newPoints;
      const { error: updateError } = await supabase
        .from('total_points')
        .update({ total_points: newTotalPoints, updated_at: new Date() })
        .eq('user_id', userId);
  
      if (updateError) {
        console.error('Error updating total points:', updateError);
      } else {
        console.log(`Updated points: ${currentPoints} + ${newPoints} = ${newTotalPoints}`);
      }
    } catch (error) {
      console.error('Error in updateTotalPoints:', error);
    }
  };


  const decrementUsers = async (cardId) => {
    try {
      // Fetch the current number of users
      const { data: cardData, error: fetchError } = await supabase
        .from('user_ads')
        .select('users')
        .eq('id', cardId)
        .single();

      if (fetchError) {
        console.error('Error fetching card data:', fetchError);
        return;
      }

      const currentUsers = cardData?.users || 0;

      // Decrement the users count
      const updatedUsers = currentUsers - 1;

      if (updatedUsers <= 0) {
        // If no users left, delete the ad from the database
        const { error: deleteError } = await supabase
          .from('user_ads')
          .delete()
          .eq('id', cardId);

        if (deleteError) {
          console.error('Error deleting ad:', deleteError);
          return;
        }

        console.log('Ad deleted successfully.');
        setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      } else {
        // Otherwise, update the users count
        const { error: updateError } = await supabase
          .from('user_ads')
          .update({ users: updatedUsers })
          .eq('id', cardId);

        if (updateError) {
          console.error('Error updating users count:', updateError);
          return;
        }

        console.log(`Users count updated to ${updatedUsers}`);
      }
    } catch (error) {
      console.error('Error in decrementUsers:', error);
    }
  };

  const handleClaimPoints = async () => {
    if (!userId || claimingCardId === null) return;
    
    // Fetch the points for the claiming card
    const { data: cardData, error: cardError } = await supabase
      .from('user_ads')
      .select('points')
      .eq('id', claimingCardId)
      .single();

    if (cardError) {
      console.error('Error fetching card data:', cardError);
      return;
    }

    const points = cardData?.points || 0;

    // Update total points
    await updateTotalPoints(userId, points);

    // Refresh the page
    window.location.reload(); // This will refresh the page
  };

  const handleClosePopup = () => {
    setShowSuccess(false); // Hide the popup
  };

  useEffect(() => {
    let timeoutId;

    if (showSuccess) {
      timeoutId = setTimeout(() => {
        setShowSuccess(false); // Automatically close the popup after 2 seconds
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [showSuccess]);

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div key={refreshKey}>
      <div className="banner">
        <div className="banner-content">
          <p>
            📢 If you encounter any inappropriate advertisements, please report them immediately. 📢 Review our Terms of Use for more information. 📢 We strictly prohibit erotic and gambling advertisements.
          </p>
        </div>
      </div>
      <div className="banner">
        <div className="banner-arabic">
          <p style={{ fontSize: '1em' }}>
            📢 إذا صادفت أي إعلانات غير لائقة، يرجى الإبلاغ عنها فورًا. 📢 راجع شروط الاستخدام الخاصة بنا لمزيد من المعلومات. 📢 نحن نحظر بشدة الإعلانات الإباحية وإعلانات المقامرة.
          </p>
        </div>
      </div>
      <h1>Short Links ({cards.length})</h1>
      <div className="card-container">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div
              key={card.id}
              className={`card ${claimingCardId === card.id ? 'claiming' : ''}`}
              style={{ opacity: card.status === 'locked' ? 0.5 : 1 }}
            >
              <h2>Points: {card.points} <FaCheckCircle /></h2>
              <p>{card.short_description || 'No Description'}</p>
              {claimingCardId === card.id && timer > 0 ? (
                <div className="claim-timer">
                  <p>Claiming in: {timer} seconds</p>
                </div>
              ) : (
                <div className="line">
                <button
                  onClick={() => handleTake(card.id, card.link)}
                  disabled={card.status === 'locked'}
                >
                  Take <FaExternalLinkAlt />
                </button>
                <button
                style={{ width: '70px'}}
                    onClick={() => handleCopy(card.link)}
                  >
                  <FaCopy />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No ShortLinks available</p>
        )}
      </div>
      {showSuccess && (
        <div className="popup-overlay">
          <div className="success-popup">
            <h2>Success</h2>
            <p>You've claimed the points successfully!</p>
            <button hidden onClick={handleClaimPoints}>Claim Points</button>
            <button hidden className="popup-close" onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Links;
