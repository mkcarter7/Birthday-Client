'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';
import { isAdmin } from '@/utils/admin';
import { PARTY_CONFIG } from '@/config/party';

export default function AdminDashboardPage() {
  const { user, userLoading } = useAuth();
  const [stats, setStats] = useState({
    rsvps: { total: 0, yes: 0, maybe: 0, no: 0, totalGuests: 0 },
    guestbook: { total: 0 },
    photos: { total: 0 },
    loading: true,
  });

  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !userIsAdmin) return;

      try {
        const headers = {};
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (tokenError) {
          console.error('Error getting token:', tokenError);
        }

        // Fetch RSVP stats
        try {
          const rsvpRes = await fetch('/api/rsvp', { headers });
          if (rsvpRes.ok) {
            const rsvpData = await rsvpRes.json();
            const filtered = Array.isArray(rsvpData) ? rsvpData.filter((r) => String(r.party) === String(PARTY_CONFIG.id)) : [];
            const yes = filtered.filter((r) => r.status === 'yes').length;
            const maybe = filtered.filter((r) => r.status === 'maybe').length;
            const no = filtered.filter((r) => r.status === 'no').length;
            const totalGuests = filtered.filter((r) => r.status === 'yes').reduce((sum, r) => sum + (r.guest_count || 1), 0);

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

        // Fetch Guestbook stats
        try {
          const guestbookRes = await fetch('/api/guestbook', { headers });
          if (guestbookRes.ok) {
            const guestbookData = await guestbookRes.json();
            const filtered = Array.isArray(guestbookData) ? guestbookData.filter((m) => String(m.party) === String(PARTY_CONFIG.id) && !m.deleted && !m.is_deleted) : [];
            setStats((prev) => ({
              ...prev,
              guestbook: { total: filtered.length },
            }));
          }
        } catch (e) {
          console.error('Error fetching guestbook:', e);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    if (!userLoading && user && userIsAdmin) {
      fetchStats();
    } else if (!userLoading) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [user, userLoading, userIsAdmin]);

  if (userLoading) {
    return (
      <main className="page">
        <PageHeader title="Admin Dashboard" subtitle="Party management and statistics" />
        <div className="card">
          <p className="muted">Loading...</p>
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
      <PageHeader title="Admin Dashboard" subtitle="Party management and statistics" />

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

      {/* Admin Links */}
      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Admin Tools</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <Link
            href="/admin/rsvps"
            className="tile tile-purple"
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>👥</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>View All RSVPs</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {stats.rsvps.total} RSVP{stats.rsvps.total !== 1 ? 's' : ''} • {stats.rsvps.totalGuests} total guests
                </div>
              </div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>

          <Link
            href="/guestbook"
            className="tile tile-teal"
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>💬</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>View Guestbook</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {stats.guestbook.total} message{stats.guestbook.total !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>

          <Link
            href="/photos"
            className="tile tile-pink"
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📷</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>View Photos</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Manage party photos</div>
              </div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
