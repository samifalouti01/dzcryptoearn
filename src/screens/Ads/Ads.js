import React, { useState, useEffect } from 'react';
import Exchange from './Ads/Exchange';
import CreateAds from './Ads/CreateAds';
import ManageAds from './Ads/ManageAds';
import CreateOffer from './Ads/CreateOffer'; 
import ManageOffers from './Ads/ManageOffers'; 
import CreateShort from './Ads/CreateShort'; 
import ManageShort from './Ads/ManageShort'; 
import { supabase } from '../../supabaseClient'; 
import './Ads.css';

function Ads() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [exchangedPoints, setExchangedPoints] = useState(0); // Removed unused userId

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error fetching user:', authError);
        return;
      }

      const userId = user?.id;
      if (!userId) return;

      // Fetch total points and exchanged points for the user
      const { data: userData, error: userError } = await supabase
        .from('total_points')
        .select('exchanged_points')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      const totalExchangedPoints = userData?.exchanged_points || 0;
      setExchangedPoints(totalExchangedPoints); // Update local exchanged points
    };

    fetchUserData(); // Fixed the typo here
  }, []);

  return (
    <div className="ads-container">
      <h1>Ads Management</h1>
      <h3>Exchanged points: {exchangedPoints}</h3>
      <div className="tabs">
        <button onClick={() => setActiveTab('exchange')}>Exchange Points</button>
        <button onClick={() => setActiveTab('create')}>Create Ads</button>
        <button onClick={() => setActiveTab('manage')}>Manage Ads</button>
        <button onClick={() => setActiveTab('createShort')}>Create Shortlink</button>
        <button onClick={() => setActiveTab('manageShort')}>Manage Shortlink</button>
        <button onClick={() => setActiveTab('createOffer')}>Create Offer</button> {/* New tab */}
        <button onClick={() => setActiveTab('manageOffer')}>Manage Offers</button> {/* New tab */}
      </div>

      <div className="tab-content">
        {activeTab === 'exchange' && <Exchange />}
        {activeTab === 'create' && <CreateAds />}
        {activeTab === 'manage' && <ManageAds />}
        {activeTab === 'createShort' && <CreateShort />}
        {activeTab === 'manageShort' && <ManageShort />}
        {activeTab === 'createOffer' && <CreateOffer />} {/* New tab content */}
        {activeTab === 'manageOffer' && <ManageOffers />} {/* New tab content */}
      </div>
    </div>
  );
}

export default Ads;
