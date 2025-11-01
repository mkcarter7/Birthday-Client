'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TriviaGame from '@/components/TriviaGame';

/* eslint-disable react/prop-types */
export default function GameDetailPage({ params }) {
  const { id } = params;
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [results, setResults] = useState(null);
  const [fullResponse, setFullResponse] = useState(null);

  const handleGameComplete = (score, resultData, fullData) => {
    setFinalScore(score);
    setResults(resultData);
    setFullResponse(fullData);
    setGameComplete(true);
  };

  const getGameTitle = () => {
    switch (id) {
      case 'trivia':
        return 'Party Trivia';
      case 'memory':
        return 'Photo Memory Match';
      default:
        return `Game: ${id}`;
    }
  };

  const getGameSubtitle = () => {
    switch (id) {
      case 'trivia':
        return 'Test your knowledge and earn points!';
      case 'memory':
        return 'Match the pairs and win points!';
      default:
        return 'Demo game screen';
    }
  };

  const renderGameContent = () => {
    if (gameComplete) {
      return (
        <div className="card" style={{ display: 'grid', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: 0 }}>Game Complete!</h2>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>{finalScore} Points Earned!</div>
          {results && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{results.correct_answers}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Correct</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6' }}>{results.total_questions}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Total</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{results.accuracy?.toFixed(0)}%</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Accuracy</div>
                </div>
              </div>

              {/* Question-by-Question Results */}
              {fullResponse?.question_results && fullResponse.question_results.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginBottom: 16 }}>Question Review</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {fullResponse.question_results.map((qResult) => (
                      <div
                        key={qResult.question_id}
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          background: qResult.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${qResult.is_correct ? '#10b981' : '#ef4444'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                          <div style={{ fontSize: 20 }}>{qResult.is_correct ? '✅' : '❌'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{qResult.question}</div>
                            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
                              <div>
                                <strong>Your answer:</strong> Option {String.fromCharCode(65 + qResult.your_answer)} ({qResult.your_answer})
                              </div>
                              {!qResult.is_correct && (
                                <div style={{ marginTop: 4 }}>
                                  <strong>Correct answer:</strong> Option {String.fromCharCode(65 + qResult.correct_answer)} ({qResult.correct_answer})
                                </div>
                              )}
                              <div style={{ marginTop: 4, color: qResult.is_correct ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {qResult.points_earned} points {qResult.is_correct ? 'earned' : '(0 points)'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Summary */}
              {fullResponse?.score && (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>New Total Score</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{fullResponse.score.total_points} points</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>Level</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{fullResponse.score.level}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <p className="muted" style={{ marginTop: 16 }}>
            Your score has been saved to the leaderboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <Link href="/games" className="tile tile-purple" style={{ textDecoration: 'none', padding: '12px 24px' }}>
              ← Back to Games
            </Link>
            <button
              type="button"
              onClick={() => {
                setGameComplete(false);
                setFinalScore(0);
                setResults(null);
                window.location.reload();
              }}
              className="tile tile-teal"
              style={{ border: 'none', padding: '12px 24px' }}
            >
              Play Again
            </button>
          </div>
        </div>
      );
    }

    if (id === 'trivia') {
      return <TriviaGame onComplete={handleGameComplete} />;
    }

    if (id === 'memory') {
      return (
        <div className="card">
          <p>Memory game coming soon!</p>
          <Link href="/games" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
            ← Back to Games
          </Link>
        </div>
      );
    }

    return (
      <div className="card">
        <p>Game not found.</p>
        <Link href="/games" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
          ← Back to Games
        </Link>
      </div>
    );
  };

  return (
    <main className="page">
      <PageHeader title={getGameTitle()} subtitle={getGameSubtitle()} />
      {renderGameContent()}
    </main>
  );
}
