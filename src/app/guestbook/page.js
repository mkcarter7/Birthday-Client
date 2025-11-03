'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';
import { PARTY_CONFIG } from '@/config/party';

export default function GuestbookPage() {
  const { user, userLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Don't auto-fill name - let user enter their own name

  // Clear authentication errors when user successfully signs in after being logged out
  const prevUserRef = useRef(user);
  useEffect(() => {
    // If user transitions from not logged in to logged in, clear any errors
    if (!prevUserRef.current && user && error) {
      setError('');
    }
    prevUserRef.current = user;
  }, [user, error]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const headers = {};

        // Include auth token if user is logged in
        if (user) {
          try {
            const token = await user.getIdToken();
            headers.Authorization = `Bearer ${token}`;
          } catch (tokenError) {
            console.error('Error getting token:', tokenError);
          }
        }

        const res = await fetch('/api/guestbook', {
          headers,
        });

        if (res.ok) {
          const data = await res.json();

          // Filter messages for this party and sort by date (newest first)
          // Handle both string and number party IDs
          const partyId = PARTY_CONFIG.id;

          const filtered = Array.isArray(data)
            ? data.filter((m) => {
                if (m.deleted || m.is_deleted) {
                  return false;
                }
                // Compare party ID handling both string and number types
                const msgPartyId = m.party || m.party_id || m.party_name;
                return msgPartyId === partyId || String(msgPartyId) === String(partyId);
              })
            : [];
          filtered.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

          // Only warn if there's an issue
          if (Array.isArray(data) && data.length > 0 && filtered.length === 0) {
            console.warn('⚠️ Guestbook - All messages filtered out (party ID mismatch)', {
              totalMessages: data.length,
              partyId,
            });
          }

          setMessages(filtered);
        } else if (res.status === 403) {
          // If unauthorized, show empty list but log the issue
          console.error('⚠️ Guestbook fetch - 403 Unauthorized. Messages cannot be loaded.', {
            user: user ? { email: user.email, uid: user.uid } : null,
            isSignedIn: !!user,
          });
          setError('Unable to load messages. You may not have permission to view the guestbook.');
          setMessages([]);
        } else {
          console.error('Guestbook fetch - Error response:', res.status);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if not loading user state
    if (!userLoading) {
      fetchMessages();
    }
  }, [user, userLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to leave a message');
      return;
    }

    if (!message.trim()) {
      setError('Please write a message');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Use name from form (user's custom choice)
    const messageName = name.trim();

    setSubmitting(true);
    setError('');

    try {
      // Verify user is still authenticated
      if (!user) {
        setError('You must be signed in to leave a message. Please sign in again.');
        return;
      }

      // Get a fresh token, forcing refresh
      let token;
      try {
        token = await user.getIdToken(true);
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        setError('Authentication error. Please try signing out and signing back in.');
        return;
      }

      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: messageName,
          message: message.trim(),
          party: PARTY_CONFIG.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Add the new message to the list
        setMessages([data, ...messages]);
        setName('');
        setMessage('');
        setError('');
      } else if (res.status === 403 || res.status === 401) {
        // Handle authentication/authorization errors
        console.error('Guestbook submit - Auth error details:', data);
        // Don't show error for token-related issues, just log them
        if (data.details && data.details.includes('token')) {
          console.error('Token validation failed - session may have expired');
          // Don't set error, just log
        } else if (data.error && data.error.includes('token')) {
          console.error('Token validation failed - session may have expired');
          // Don't set error, just log
        } else {
          // Show other authentication errors
          const errorMsg = data.details || data.error || 'You do not have permission to perform this action.';
          setError(errorMsg);
        }
      } else {
        const errorMsg = data.details || data.error || 'Failed to submit message. Please try again.';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error submitting message:', err);
      if (err.message && err.message.includes('token')) {
        // Don't show error for token issues, just log
        console.error('Token error occurred during submission');
      } else {
        setError('Failed to submit message. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to extract author name from message object
  const getAuthorName = (msg) => {
    // Priority 1: Use the custom name field (set by user when submitting)
    if (msg.name && msg.name.trim()) {
      return msg.name.trim();
    }

    // Priority 2: Check flattened name fields
    if (msg.author_name && msg.author_name.trim()) return msg.author_name.trim();
    if (msg.full_name && msg.full_name.trim()) return msg.full_name.trim();

    // Priority 3: If author is an object (nested user object from Django)
    if (msg.author && typeof msg.author === 'object') {
      // Try full name first (first_name + last_name)
      if (msg.author.first_name && msg.author.last_name) {
        return `${msg.author.first_name} ${msg.author.last_name}`.trim();
      }
      // Then try individual name fields
      if (msg.author.first_name && msg.author.first_name.trim()) return msg.author.first_name.trim();
      if (msg.author.last_name && msg.author.last_name.trim()) return msg.author.last_name.trim();
      if (msg.author.name && msg.author.name.trim()) return msg.author.name.trim();
      if (msg.author.username && msg.author.username.trim()) return msg.author.username.trim();
      if (msg.author.email) return msg.author.email.split('@')[0];
    }

    // Priority 4: Other fallback fields
    if (msg.author_username && msg.author_username.trim()) return msg.author_username.trim();
    if (msg.username && msg.username.trim()) return msg.username.trim();
    if (typeof msg.author === 'string' && msg.author.trim()) return msg.author.trim();

    return 'Anonymous';
  };

  const isMessageOwner = (msg) => {
    if (!user) {
      return false;
    }

    // Get current user identifiers
    const userId = user.uid; // Firebase UID
    const userEmail = user.email?.toLowerCase().trim();

    // Priority 1: Check can_edit field if backend provides it
    if (msg.can_edit === true) {
      return true;
    }

    // Priority 2: Check author_username field (backend returns Firebase UID here)
    if (msg.author_username && msg.author_username === userId) {
      return true;
    }

    // Helper to normalize email
    const normalizeEmail = (email) => email?.toLowerCase().trim();
    const checkEmail = (email) => {
      const normalized = normalizeEmail(email);
      return normalized && normalized === userEmail;
    };

    // Priority 3: If author is an object (nested user object from Django)
    if (msg.author && typeof msg.author === 'object') {
      // Match by email (most reliable since Django User email should match Firebase email)
      if (checkEmail(msg.author.email)) {
        return true;
      }

      // Match by username if it matches Firebase UID
      if (msg.author.username && msg.author.username === userId) {
        return true;
      }

      // Match by ID if backend uses Firebase UID (less common but possible)
      const authorId = msg.author.id || msg.author.pk;
      if (authorId && (authorId.toString() === userId || authorId === userId)) {
        return true;
      }
    }

    // Priority 4: Check flattened author_id field (if backend flattens the author)
    if (msg.author_id) {
      const authorIdStr = msg.author_id.toString();
      if (authorIdStr === userId || msg.author_id === userId) {
        return true;
      }
    }

    // Priority 5: Check if author is a string/number ID matching Firebase UID
    if (typeof msg.author === 'string' || typeof msg.author === 'number') {
      const authorStr = msg.author.toString();
      if (authorStr === userId) {
        return true;
      }
    }

    // Priority 6: Check email-based fields (comprehensive fallback)
    if (userEmail) {
      if (checkEmail(msg.author_email) || checkEmail(msg.user_email) || checkEmail(msg.email) || checkEmail(msg.author_email)) {
        return true;
      }
    }

    // Priority 7: Check other user identifier fields
    if (msg.user === userId || msg.user_id === userId || msg.created_by === userId) {
      return true;
    }

    return false;
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setEditName(getAuthorName(msg));
    setEditMessage(msg.message || msg.content || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditMessage('');
  };

  const handleSaveEdit = async (msgId) => {
    if (!editName.trim() || !editMessage.trim()) {
      setError('Please fill in both name and message');
      return;
    }

    setSavingEdit(true);
    setError('');

    try {
      // Verify user is still authenticated
      if (!user) {
        setError('You must be signed in to edit messages. Please sign in again.');
        return;
      }

      // Get a fresh token, forcing refresh
      let token;
      try {
        token = await user.getIdToken(true);
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        setError('Authentication error. Please try signing out and signing back in.');
        return;
      }

      const res = await fetch(`/api/guestbook/${msgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          message: editMessage.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update the message in the list
        setMessages(messages.map((msg) => (msg.id === msgId ? data : msg)));
        setEditingId(null);
        setEditName('');
        setEditMessage('');
        setError('');
      } else if (res.status === 403 || res.status === 401) {
        // Handle authentication/authorization errors
        if (data.error && data.error.includes('token')) {
          // Don't show error for token issues, just log
          console.error('Token validation failed during edit - session may have expired');
        } else {
          setError(data.error || 'You do not have permission to edit this message.');
        }
      } else {
        setError(data.error || 'Failed to update message. Please try again.');
      }
    } catch (err) {
      console.error('Error updating message:', err);
      if (err.message && err.message.includes('token')) {
        // Don't show error for token issues, just log
        console.error('Token error occurred during edit');
      } else {
        setError('Failed to update message. Please try again.');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (msgId) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeletingId(msgId);
    setError('');

    try {
      // Verify user is still authenticated
      if (!user) {
        setError('You must be signed in to delete messages. Please sign in again.');
        setDeletingId(null);
        return;
      }

      // Get a fresh token, forcing refresh
      let token;
      try {
        token = await user.getIdToken(true);
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        setError('Authentication error. Please try signing out and signing back in.');
        setDeletingId(null);
        return;
      }

      const res = await fetch(`/api/guestbook/${msgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove the message from the list
        setMessages(messages.filter((msg) => msg.id !== msgId));
        setError('');
      } else {
        const data = await res.json();
        // Handle specific error cases
        if (res.status === 403 || res.status === 401) {
          if (data.error && data.error.includes('token')) {
            // Don't show error for token issues, just log
            console.error('Token validation failed during delete - session may have expired');
          } else {
            setError(data.error || 'You do not have permission to delete this message.');
          }
        } else {
          setError(data.error || 'Failed to delete message. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      if (err.message && err.message.includes('token')) {
        // Don't show error for token issues, just log
        console.error('Token error occurred during delete');
      } else {
        setError('Failed to delete message. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (userLoading || loading) {
    return (
      <main className="page">
        <PageHeader title="Guest Book" subtitle="Leave a sweet message for Ivy" />
        <div className="card">
          <p className="muted">Loading messages...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader title="Guest Book" subtitle="Leave a sweet message for Ivy" />

      {error && (
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <p style={{ color: '#ef4444', margin: 0, fontSize: 14, flex: 1 }}>{error}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setError('')}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {!user ? (
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <p>Sign in to leave a message in Ivy&apos;s guest book!</p>
          <button type="button" onClick={signIn} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <h3>Leave a Message</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gap: 4 }}>
              <label htmlFor="guestbook-name" style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Your Name (you can use any name you&apos;d like)
              </label>
              <input id="guestbook-name" type="text" placeholder="Enter your name..." value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            </div>
            <textarea placeholder="Write your message for Ivy..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', resize: 'vertical', fontFamily: 'inherit' }} />
            {error && <p style={{ color: '#ef4444', margin: 0, fontSize: 14 }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="tile tile-purple"
              style={{
                height: 48,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '⏳ Submitting...' : '➕ Submit Message'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ display: 'grid', gap: 16 }}>
        <h3>Messages ({messages.length})</h3>
        {messages.length === 0 ? (
          <p className="muted">No messages yet. Be the first to leave a message for Ivy!</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {messages.map((msg) => {
              const isOwner = isMessageOwner(msg);
              const isEditing = editingId === msg.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    padding: 16,
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} rows={4} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', resize: 'vertical', fontFamily: 'inherit' }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg.id)}
                          disabled={savingEdit}
                          className="tile tile-purple"
                          style={{
                            height: 40,
                            border: 'none',
                            flex: 1,
                            fontSize: 14,
                            fontWeight: 600,
                            opacity: savingEdit ? 0.6 : 1,
                            cursor: savingEdit ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {savingEdit ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          style={{
                            height: 40,
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            background: 'white',
                            flex: 1,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: savingEdit ? 'not-allowed' : 'pointer',
                            opacity: savingEdit ? 0.6 : 1,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!savingEdit) {
                              e.target.style.background = '#f9fafb';
                              e.target.style.borderColor = '#d1d5db';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.borderColor = '#e5e7eb';
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: '#4338ca', fontSize: 16 }}>{getAuthorName(msg)}</div>
                        {isOwner && user && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(msg)}
                              disabled={deletingId === msg.id || editingId === msg.id || savingEdit}
                              style={{
                                background: PARTY_CONFIG.secondaryColor || '#8B5CF6',
                                border: `1px solid ${PARTY_CONFIG.secondaryColor || '#8B5CF6'}`,
                                color: 'white',
                                cursor: deletingId === msg.id || editingId === msg.id || savingEdit ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontWeight: 500,
                                opacity: deletingId === msg.id || editingId === msg.id || savingEdit ? 0.6 : 1,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                if (!deletingId && editingId !== msg.id && !savingEdit) {
                                  // Darken the secondary color for hover
                                  const hoverColor = PARTY_CONFIG.secondaryColor || '#8B5CF6';
                                  e.target.style.background = hoverColor;
                                  e.target.style.filter = 'brightness(0.85)';
                                  e.target.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = PARTY_CONFIG.secondaryColor || '#8B5CF6';
                                e.target.style.filter = 'none';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(msg.id)}
                              disabled={deletingId === msg.id || editingId === msg.id || savingEdit}
                              style={{
                                background: PARTY_CONFIG.accentColor || '#F59E0B',
                                border: `1px solid ${PARTY_CONFIG.accentColor || '#F59E0B'}`,
                                color: 'white',
                                cursor: deletingId === msg.id || editingId === msg.id || savingEdit ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontWeight: 500,
                                opacity: deletingId === msg.id || editingId === msg.id || savingEdit ? 0.6 : 1,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                if (deletingId !== msg.id && editingId !== msg.id && !savingEdit) {
                                  // Darken the accent color for hover
                                  const hoverColor = PARTY_CONFIG.accentColor || '#F59E0B';
                                  e.target.style.background = hoverColor;
                                  e.target.style.filter = 'brightness(0.85)';
                                  e.target.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = PARTY_CONFIG.accentColor || '#F59E0B';
                                e.target.style.filter = 'none';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              {deletingId === msg.id ? '⏳ Deleting...' : '🗑️ Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.message || msg.content}</div>
                      {msg.created_at && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                          {new Date(msg.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
