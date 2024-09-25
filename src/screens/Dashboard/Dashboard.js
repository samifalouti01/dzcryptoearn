import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [totalPoints, setTotalPoints] = useState(0); // Renamed to totalPoints
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) return;

      // Fetch total claimed points from the total_points table
      const { data: totalPointsData, error: totalPointsError } = await supabase
        .from('total_points')
        .select('total_points')
        .eq('user_id', userId)
        .single(); // Fetch single record for the current user

      if (totalPointsError) {
        console.error('Error fetching total points:', totalPointsError);
        return;
      }

      setTotalPoints(totalPointsData?.total_points || 0); // Updated to total_points

      // Fetch recent activity (assuming activity is logged in the 'user_data' table)
      const { data: recentActivityData, error: recentActivityError } = await supabase
        .from('user_data')
        .select('points, visited_at')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false })
        .limit(5); // Fetch latest 5 records

      if (recentActivityError) {
        console.error('Error fetching recent activity:', recentActivityError);
        return;
      }

      const recent = recentActivityData.map((entry) => ({
        points: entry.points || 0, // Ensure points is not undefined
        visited_at: new Date(entry.visited_at),
      }));
      setRecentActivity(recent);

      // Fetch leaderboard (top 3 users from the total_points table)
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('total_points')
        .select('user_id, total_points') // Updated to total_points
        .order('total_points', { ascending: false })
        .limit(3); // Fetch top 3 users

      if (leaderboardError) {
        console.error('Error fetching leaderboard data:', leaderboardError);
        return;
      }

      // Fetch usernames for leaderboard users
      const leaderboardWithNames = await Promise.all(
        leaderboardData.map(async (entry) => {
          const { data: userInfo, error: userError } = await supabase
            .from('users') // assuming the table that stores user info is 'users'
            .select('username')
            .eq('id', entry.user_id)
            .single();

          if (userError) {
            console.error('Error fetching username:', userError);
            return { ...entry, username: 'Unknown' };
          }

          return { ...entry, username: userInfo.username };
        })
      );

      setLeaderboard(leaderboardWithNames);
      setUser(user); // Set the current user data
    };

    fetchDashboardData();
  }, []);

  const formatTimeAgo = (date) => {
    const diff = (Date.now() - date.getTime()) / 1000; // Difference in seconds
    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`; // 7 days
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`; // 30 days
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`; // 365 days
    return `${Math.floor(diff / 31536000)} years ago`;
  };

  return (
    <div className="dashboard">
      <div className="headerd">
        <h1>Welcome, {user?.email || 'User'}!</h1>
        <p>Total Points: {totalPoints.toLocaleString()}</p> {/* Updated to show total_points */}
      </div>
      <main style={{ background: "none" }}>
        <section>
          <h2>Recent Activity</h2>
          <ul>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <li key={index}>
                  <span>Claimed {activity.points.toLocaleString()} points</span>
                  <span>{formatTimeAgo(activity.visited_at)}</span>
                </li>
              ))
            ) : (
              <li>No recent activity</li>
            )}
          </ul>
        </section>

        <section>
          <h2>Leaderboard</h2>
          <ul>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <li key={index}>
                  <span>{index + 1}st </span>
                  <span>{entry.username || 'Unknown'} </span>
                  <span>{(entry.total_points || 0).toLocaleString()} points</span> {/* Updated to show total_points */}
                </li>
              ))
            ) : (
              <li>No leaderboard data</li>
            )}
          </ul>
        </section>
      </main>
      <footer>
        <Link to="/main/links">View Shortlinks</Link>
      </footer>
    </div>
  );
}

export default Dashboard;
