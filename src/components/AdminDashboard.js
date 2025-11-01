'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';
import { isAdmin } from '@/utils/admin';
import { PARTY_CONFIG } from '@/config/party';

export default function AdminDashboard() {
  const { user, userLoading } = useAuth();
  const [stats, setStats] = useState({
    rsvps: { total: 0, yes: 0, maybe: 0, no: 0, totalGuests: 0 },
    guestbook: { total: 0 },
    photos: { total: 0 },
    loading: true,
  });
  const [rsvps, setRsvps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || !userIsAdmin) return;

      try {
        const headers = {};
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (tokenError) {
          console.error('Error getting token:', tokenError);
        }

        // Fetch RSVPs with full data
        try {
          const rsvpRes = await fetch('/api/rsvp', { headers });
          if (rsvpRes.ok) {
            const rsvpData = await rsvpRes.json();
            const filtered = Array.isArray(rsvpData) ? rsvpData.filter((r) => String(r.party) === String(PARTY_CONFIG.id)) : [];
            const yes = filtered.filter((r) => r.status === 'yes').length;
            const maybe = filtered.filter((r) => r.status === 'maybe').length;
            const no = filtered.filter((r) => r.status === 'no').length;
            const totalGuests = filtered.filter((r) => r.status === 'yes').reduce((sum, r) => sum + (r.guest_count || 1), 0);

            // Sort by created_at, newest first
            filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            setRsvps(filtered);

            setStats((prev) => ({
              ...prev,
              rsvps: {
                total: filtered.length,
                yes,
                maybe,
                no,
                totalGuests,
              },
            }));
          }
        } catch (e) {
          console.error('Error fetching RSVPs:', e);
        }

        // Fetch Guestbook messages with full data
        try {
          const guestbookRes = await fetch('/api/guestbook', { headers });
          if (guestbookRes.ok) {
            const guestbookData = await guestbookRes.json();
            const filtered = Array.isArray(guestbookData) ? guestbookData.filter((m) => String(m.party) === String(PARTY_CONFIG.id) && !m.deleted && !m.is_deleted) : [];

            // Sort by created_at, newest first
            filtered.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
            setMessages(filtered);

            setStats((prev) => ({
              ...prev,
              guestbook: { total: filtered.length },
            }));
          }
        } catch (e) {
          console.error('Error fetching guestbook:', e);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setStats((prev) => ({ ...prev, loading: false }));
        setLoadingData(false);
      }
    };

    if (!userLoading && user && userIsAdmin) {
      fetchAllData();
    } else if (!userLoading) {
      setStats((prev) => ({ ...prev, loading: false }));
      setLoadingData(false);
    }
  }, [user, userLoading, userIsAdmin]);

  // Helper functions for RSVP display
  const getStatusColor = (status) => {
    switch (status) {
      case 'yes':
        return '#10b981';
      case 'maybe':
        return '#f59e0b';
      case 'no':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'yes':
        return "Yes, I'll be there! 🎉";
      case 'maybe':
        return 'Maybe 🤔';
      case 'no':
        return "Sorry, can't make it";
      default:
        return status;
    }
  };

  // Helper function to get author name from message
  const getAuthorName = (msg) => {
    if (msg.name && msg.name.trim()) return msg.name.trim();
    if (msg.author_name && msg.author_name.trim()) return msg.author_name.trim();
    if (msg.full_name && msg.full_name.trim()) return msg.full_name.trim();
    if (msg.author && typeof msg.author === 'object') {
      if (msg.author.first_name && msg.author.last_name) {
        return `${msg.author.first_name} ${msg.author.last_name}`.trim();
      }
      if (msg.author.first_name) return msg.author.first_name.trim();
      if (msg.author.username) return msg.author.username.trim();
      if (msg.author.email) return msg.author.email.split('@')[0];
    }
    if (msg.author_username) return msg.author_username.trim();
    if (typeof msg.author === 'string') return msg.author.trim();
    return 'Anonymous';
  };

  if (userLoading || loadingData || stats.loading) {
    return (
      <main className="page">
        <PageHeader title="Admin Dashboard" subtitle="Party management and statistics" />
        <div className="card">
          <p className="muted">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <PageHeader title="Admin Dashboard" subtitle="Party management and statistics" />
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <p>Please sign in to access the admin dashboard.</p>
          <button type="button" onClick={signIn} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  if (!userIsAdmin) {
    return (
      <main className="page">
        <PageHeader title="Admin Dashboard" subtitle="Party management and statistics" />
        <div className="card" style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: 0 }}>Access Denied</h2>
          <p className="muted">You don&apos;t have permission to access the admin dashboard.</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>If you believe this is an error, please contact the party administrator.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader title="Admin Dashboard" subtitle="Complete party overview and management" />

      {/* Quick Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Quick Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6' }}>{stats.rsvps.total}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Total RSVPs</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{stats.rsvps.totalGuests}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Total Guests</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6' }}>{stats.guestbook.total}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Guestbook Messages</div>
          </div>
        </div>
      </div>

      {/* RSVP Breakdown */}
      {stats.rsvps.total > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>RSVP Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.rsvps.yes}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Attending</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.rsvps.maybe}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Maybe</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats.rsvps.no}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Not Attending</div>
            </div>
          </div>
        </div>
      )}

      {/* All RSVPs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>All RSVPs ({rsvps.length})</h3>
          <Link href="/admin/rsvps" style={{ fontSize: 14, color: '#8b5cf6', textDecoration: 'none' }}>
            View detailed view →
          </Link>
        </div>

        {rsvps.length === 0 ? (
          <p className="muted">No RSVPs yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12, maxHeight: '600px', overflowY: 'auto' }}>
            {rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                style={{
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 12,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#4338ca', marginBottom: 4 }}>{rsvp.user?.username || rsvp.user?.email || rsvp.user_name || 'Unknown User'}</div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatusColor(rsvp.status)}20`,
                        color: getStatusColor(rsvp.status),
                        border: `1px solid ${getStatusColor(rsvp.status)}`,
                      }}
                    >
                      {getStatusLabel(rsvp.status)}
                    </div>
                  </div>
                  {rsvp.status === 'yes' && rsvp.guest_count > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>Guests</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#8b5cf6' }}>{rsvp.guest_count}</div>
                    </div>
                  )}
                </div>

                {(rsvp.phone_number || rsvp.dietary_restrictions || rsvp.notes) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    {rsvp.phone_number && (
                      <div style={{ fontSize: 14, marginBottom: 8 }}>
                        <strong>Phone:</strong> {rsvp.phone_number}
                      </div>
                    )}
                    {rsvp.dietary_restrictions && (
                      <div style={{ fontSize: 14, marginBottom: 8 }}>
                        <strong>Dietary Restrictions:</strong> {rsvp.dietary_restrictions}
                      </div>
                    )}
                    {rsvp.notes && (
                      <div style={{ fontSize: 14 }}>
                        <strong>Notes:</strong> {rsvp.notes}
                      </div>
                    )}
                  </div>
                )}

                {rsvp.created_at && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    RSVP submitted:{' '}
                    {new Date(rsvp.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guestbook Messages */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Guestbook Messages ({messages.length})</h3>
          <Link href="/guestbook" style={{ fontSize: 14, color: '#8b5cf6', textDecoration: 'none' }}>
            View full guestbook →
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="muted">No guestbook messages yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12, maxHeight: '500px', overflowY: 'auto' }}>
            {messages.slice(0, 10).map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 12,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#4338ca' }}>{getAuthorName(msg)}</div>
                  {msg.created_at && (
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(msg.created_at || msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.message || msg.text || 'No message content'}</div>
              </div>
            ))}
            {messages.length > 10 && (
              <div style={{ textAlign: 'center', padding: 16, color: '#6b7280', fontSize: 14 }}>
                ... and {messages.length - 10} more message{messages.length - 10 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Quick Links</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Link
            href="/admin/rsvps"
            className="tile tile-purple"
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            👥 Detailed RSVP View
          </Link>
          <Link
            href="/guestbook"
            className="tile tile-teal"
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            💬 Full Guestbook
          </Link>
          <Link
            href="/photos"
            className="tile tile-pink"
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            📷 View Photos
          </Link>
        </div>
      </div>
    </main>
  );
}
