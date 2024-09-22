import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (user) {
        setUserId(user.id);
        console.log('User ID fetched:', user.id);
      } else {
        console.log('No user logged in');
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const presenceChannel = supabase.channel('online-users', {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Presence state updated:', state);
        setOnlineUsers(Object.keys(state).length);
      });

      presenceChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to presence channel');
        } else {
          console.log('Subscription status:', status);
        }
      });

      return () => {
        console.log('Unsubscribing from presence channel');
        presenceChannel.unsubscribe();
      };
    }
  }, [userId]);

  return (
    <div className="online-users">
      <p>Users Online: {onlineUsers}</p>
    </div>
  );
};

export default OnlineUsers;
