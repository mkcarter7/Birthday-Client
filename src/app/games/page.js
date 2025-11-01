'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/utils/context/authContext';
import { PARTY_CONFIG } from '@/config/party';
import { getUserScore, getLeaderboard } from '@/utils/gameScores';

const demoGames = [{ id: 'trivia', name: 'Party Trivia', icon: '🧠', description: 'Test your knowledge!' }];

export default function GamesPage() {
  const { user, userLoading } = useAuth();
  const [userScore, setUserScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      if (userLoading) return;

      try {
        // Fetch user's score if logged in
        if (user) {
          const score = await getUserScore(user, PARTY_CONFIG.id);
          setUserScore(score);
        }

        // Fetch leaderboard
        const lb = await getLeaderboard(user, PARTY_CONFIG.id);
        setLeaderboard(lb);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [user, userLoading]);

  const getUserRank = () => {
    if (!user || !userScore) return null;
    const index = leaderboard.findIndex((entry) => entry.id === userScore.id || entry.user === user.uid || entry.user_email === user.email);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <main className="page">
      <PageHeader title="Games" subtitle="Play games & earn points" />

      {/* User Score Card */}
      {user && userScore && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Your Score</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6' }}>{userScore.points || 0}</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Total Points</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>Level {userScore.level || 1}</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Your Level</div>
            </div>
            {getUserRank() && (
              <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>#{getUserRank()}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Rank</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Available Games</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {demoGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="tile tile-purple"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 20,
                textDecoration: 'none',
                border: 'none',
              }}
            >
              <div style={{ fontSize: 48 }}>{game.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{game.name}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>{game.description}</div>
              </div>
              <div style={{ fontSize: 24 }}>→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Leaderboard</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {leaderboard.slice(0, 10).map((entry, index) => {
              const isCurrentUser = user && (entry.id === userScore?.id || entry.user === user.uid || entry.user_email === user.email);

              return (
                <div
                  key={entry.id || index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    background: isCurrentUser ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 8,
                    border: isCurrentUser ? '2px solid #8b5cf6' : '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: (() => {
                          if (index === 0) return '#fbbf24';
                          if (index === 1) return '#94a3b8';
                          if (index === 2) return '#f97316';
                          return 'rgba(139, 92, 246, 0.2)';
                        })(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                        color: index < 3 ? '#fff' : '#8b5cf6',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {entry.user_name || entry.user?.username || entry.user_email || `Player ${index + 1}`}
                        {isCurrentUser && <span style={{ marginLeft: 8, fontSize: 12, color: '#8b5cf6' }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Level {entry.level || 1}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#8b5cf6' }}>{entry.points || 0}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!user && (
        <div className="card">
          <p className="muted">Sign in to track your scores and compete on the leaderboard!</p>
        </div>
      )}
    </main>
  );
}
