import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './WatchAds.css';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ClipLoader from 'react-spinners/ClipLoader';

const WatchAds = ({ userId }) => {
  const [ads, setAds] = useState([]);
  const [selectedAdUrl, setSelectedAdUrl] = useState('');
  const [timer, setTimer] = useState(0);
  const [currentAdSeconds, setCurrentAdSeconds] = useState(15);
  const [isHidden, setIsHidden] = useState(false);
  const [loading] = useState(true);

  const updateTotalPoints = async (userId, points) => {
    try {
      // Fetch current total points for the user
      const { data: userData, error: fetchUserError } = await supabase
        .from('total_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();
  
      if (fetchUserError) {
        console.error('Error fetching user data:', fetchUserError);
        return;
      }
  
      if (!userData) {
        console.error(`No data found for user ID: ${userId}`);
        return;
      }
  
      const currentPoints = Number(userData.total_points) || 0;
      const newTotalPoints = currentPoints + points;
  
      // Update total points
      const { error: updateError } = await supabase
        .from('total_points')
        .update({ total_points: newTotalPoints, updated_at: new Date() })
        .eq('user_id', userId);
  
      if (updateError) {
        console.error('Error updating total points:', updateError);
        return;
      }
  
      console.log(`Updated points: ${currentPoints} + ${points} = ${newTotalPoints}`);
    } catch (error) {
      console.error('Error in updateTotalPoints:', error);
    }
  };  

  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('urls')
        .select('links, seconds');

      if (error) {
        console.error('Error fetching ads:', error);
      } else {
        const adData = data.map(item => ({
          url: item.links,
          seconds: item.seconds || 15,
        }));
        setAds(adData);
        if (adData.length > 0) {
          setSelectedAdUrl(adData[0].url);
          setCurrentAdSeconds(adData[0].seconds);
          setTimer(adData[0].seconds);
        }
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0 || !selectedAdUrl) return;

    const adInterval = setInterval(async () => {
      // Update points before showing the next ad
      await updateTotalPoints(userId, 70); 

      setIsHidden(true); // Hide the iframe during transition
      setTimeout(() => {
        const currentIndex = ads.findIndex(ad => ad.url === selectedAdUrl);
        const nextIndex = (currentIndex + 1) % ads.length;

        setCurrentAdSeconds(ads[nextIndex].seconds);
        setTimer(ads[nextIndex].seconds);
        setSelectedAdUrl(ads[nextIndex].url);
        setIsHidden(false); // Show the next iframe
      }, 4000); // Wait 4 seconds before showing the next ad
    }, (currentAdSeconds * 1000) + 4000);

    const countdownInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          return 0; // Stop timer when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(adInterval);
      clearInterval(countdownInterval);
    };
  }, [ads, selectedAdUrl, currentAdSeconds, userId]);

  const openCurrentWebsite = () => {
    window.open(selectedAdUrl, '_blank');
  };

  return (
    <div className="watch-ads-container">
      <div className="timer" onClick={openCurrentWebsite}>
        <FaExternalLinkAlt style={{ width: '24px', height: '24px', cursor: 'pointer', marginRight: '8px' }} />
        Open
        <p> Next ad in: {timer > 0 ? timer : <ClipLoader color={"#123abc"} loading={loading} size={50} />}</p>
      </div>
      <div className="iframe-container">
        {selectedAdUrl && !isHidden && (
          <iframe
            src={selectedAdUrl}
            title="Ad Website"
            className="ad-iframe"
            allowFullScreen
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default WatchAds;
