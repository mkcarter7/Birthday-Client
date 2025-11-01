'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';
import { PARTY_CONFIG } from '@/config/party';

function TriviaGame({ onComplete }) {
  const { user, userLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');

        const token = await user.getIdToken();
        const res = await fetch(`/api/trivia?party=${PARTY_CONFIG.id}&count=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load questions');
        }

        const data = await res.json();
        // Backend returns questions array directly or wrapped in a questions field
        if (Array.isArray(data)) {
          setQuestions(data);
        } else if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Failed to load trivia questions');
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading && user) {
      fetchQuestions();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const handleSubmitGame = async (finalAnswers) => {
    if (!user) {
      setError('Please sign in to submit your answers');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/trivia/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          party: PARTY_CONFIG.id,
          answers: finalAnswers,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit answers');
      }

      const data = await res.json();

      // Call completion callback with points earned, results, and full response data
      if (onComplete && data.results) {
        onComplete(data.results.points_earned, data.results, data);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.message || 'Failed to submit answers');
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // Save answer
    const newAnswers = [...answers];
    newAnswers.push({
      question_id: question.id,
      answer: selectedAnswer,
    });
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Submit all answers
      handleSubmitGame(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="card">
        <p className="muted">Loading trivia questions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <p>Please sign in to play trivia and earn points!</p>
        <button type="button" onClick={signIn} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="card">
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#ef4444', fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="card">
        <p className="muted">No trivia questions available for this party.</p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="card">
        <p className="muted">Submitting your answers and calculating score...</p>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 16 }}>
      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          {question.category && <span style={{ fontSize: 14, fontWeight: 500, color: '#8b5cf6' }}>{question.category}</span>}
        </div>
        <div style={{ height: 8, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#8b5cf6',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>{question.question}</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <button
                key={`option-${question.id}-${option}`}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                style={{
                  padding: 16,
                  textAlign: 'left',
                  border: `2px solid ${isSelected ? '#8b5cf6' : '#e5e7eb'}`,
                  borderRadius: 12,
                  background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#8b5cf6' : '#e5e7eb'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        {question.points && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, marginBottom: 0 }}>Worth {question.points} points</p>}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#ef4444', fontSize: 14 }}>{error}</p>
        </div>
      )}

      {/* Action Button */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="tile tile-purple"
          style={{
            height: 48,
            border: 'none',
            cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
            opacity: selectedAnswer === null ? 0.5 : 1,
          }}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

TriviaGame.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default TriviaGame;
