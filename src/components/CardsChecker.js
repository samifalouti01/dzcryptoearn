import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Links from './Links';

const CardsChecker = () => {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const { data: ads, error: adsError } = await supabase
          .from('user_ads')
          .select('*');

        if (adsError) {
          console.error('Error fetching ads:', adsError);
          return;
        }

        const { data: clickedCards, error: clickError } = await supabase
          .from('user_click')
          .select('card_id')
          .eq('user_id', userId)
          .gt('created_at', new Date(new Date() - 24 * 60 * 60 * 1000).toISOString());

        if (clickError) {
          console.error('Error fetching user clicks:', clickError);
          return;
        }

        const clickedCardIds = new Set(clickedCards.map(click => click.card_id));
        const filteredAds = ads.filter(ad => !clickedCardIds.has(ad.id));
        setCards(filteredAds);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const recordUserClick = async (userId, cardId, link) => {
    try {
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

      const { error } = await supabase
        .from('user_click')
        .insert([{ user_id: userId, card_id: cardId, links: link }]);

      if (error) {
        console.error('Error recording user click:', error);
      } else {
        console.log('Click recorded successfully');
      }
    } catch (error) {
      console.error('Error in recordUserClick:', error);
    }
  };

  const handleClaim = async (cardId) => {
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    try {
      const card = cards.find(card => card.id === cardId);
      if (!card) return;

      const earnedPoints = Number(card.points) || 0;
      const { data: userPointsData, error: userPointsError } = await supabase
        .from('total_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (userPointsError) {
        console.error('Error fetching user total points:', userPointsError);
        return;
      }

      const currentTotalPoints = Number(userPointsData?.total_points) || 0;
      const updatedTotalPoints = currentTotalPoints + earnedPoints;

      const { error: updateError } = await supabase
        .from('total_points')
        .upsert({
          user_id: userId,
          total_points: updatedTotalPoints,
        }, { onConflict: ['user_id'] });

      if (updateError) {
        console.error('Error updating total points:', updateError);
        return;
      }

      await recordUserClick(userId, cardId, card.link);
    } catch (error) {
      console.error('Error in handleClaim:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {cards.length > 0 ? (
        <Links
          cards={cards}
          onClaim={handleClaim}
        />
      ) : (
        <p>There are no cards for you today.</p>
      )}
    </div>
  );
};

export default CardsChecker;
