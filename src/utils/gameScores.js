/**
 * Game Scores Utility Functions
 * Helper functions for working with game scores and the scoring API
 */

/**
 * Get or create a score for the current user and party
 * @param {Object} user - Firebase user object
 * @param {string} partyId - Party ID
 * @returns {Promise<Object>} - Score object
 */
export const getOrCreateScore = async (user, partyId) => {
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    const token = await user.getIdToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // First, try to get existing scores for this party
    const scoresRes = await fetch(`/api/scores?party=${partyId}`, { headers });

    if (scoresRes.ok) {
      const scores = await scoresRes.json();
      // Filter for current user's score
      const userScore = Array.isArray(scores) ? scores.find((s) => s.user || s.user_id || s.user_email) : null;

      if (userScore) {
        return userScore;
      }
    }

    // No existing score, create a new one
    const createRes = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        party: partyId,
        points: 0,
        level: 1,
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      throw new Error(error.error || 'Failed to create score');
    }

    return await createRes.json();
  } catch (error) {
    console.error('Error getting/creating score:', error);
    throw error;
  }
};

/**
 * Add points to a user's score
 * @param {Object} user - Firebase user object
 * @param {string|number} scoreId - Score ID
 * @param {number} points - Points to add
 * @param {string} game - Optional game name (e.g., 'trivia', 'memory')
 * @returns {Promise<Object>} - Updated score object
 */
export const addGamePoints = async (user, scoreId, points, game = null) => {
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    const token = await user.getIdToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const body = { points };
    if (game) {
      body.game = game;
    }

    const res = await fetch(`/api/scores/${scoreId}/add_points`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to add points');
    }

    return await res.json();
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};

/**
 * Get leaderboard for a party
 * @param {Object} user - Firebase user object (optional, for authenticated requests)
 * @param {string} partyId - Party ID
 * @returns {Promise<Array>} - Leaderboard array
 */
export const getLeaderboard = async (user, partyId) => {
  try {
    const headers = {};

    if (user) {
      try {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (tokenError) {
        console.warn('Could not get token for leaderboard:', tokenError);
      }
    }

    const res = await fetch(`/api/scores/leaderboard?party=${partyId}`, { headers });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

/**
 * Get user's current score for a party
 * @param {Object} user - Firebase user object
 * @param {string} partyId - Party ID
 * @returns {Promise<Object|null>} - Score object or null
 */
export const getUserScore = async (user, partyId) => {
  if (!user) {
    return null;
  }

  try {
    const token = await user.getIdToken();
    const res = await fetch(`/api/scores?party=${partyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const scores = await res.json();
    if (!Array.isArray(scores) || scores.length === 0) {
      return null;
    }

    // Return the first score (should be the user's)
    return scores[0];
  } catch (error) {
    console.error('Error fetching user score:', error);
    return null;
  }
};
