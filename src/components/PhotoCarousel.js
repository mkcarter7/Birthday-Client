'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';

export default function PhotoCarousel() {
  const { user, userLoading } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(new Set());
  const [hiddenIds, setHiddenIds] = useState(new Set());

  const handleImageError = (photoId) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(photoId);
      return next;
    });
  };

  const handleLike = async (photoId) => {
    if (liking.has(photoId)) return;

    setLiking((prev) => new Set(prev).add(photoId));
    try {
      const res = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });
      if (res.ok) {
        // Refresh photos to get updated like count
        const photosRes = await fetch('/api/photos');
        if (photosRes.ok) {
          const data = await photosRes.json();
          const list = Array.isArray(data) ? data : data?.photos || [];
          const filtered = list.filter((p) => {
            if (!p) return false;
            if (p.deleted === true || p.is_deleted === true) return false;
            const src = p.image || p.url;
            return typeof src === 'string' && src.length > 0;
          });
          setPhotos(filtered);
        }
      }
    } catch (error) {
      console.error('Like failed:', error);
    } finally {
      setLiking((prev) => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) {
        if (isMounted) {
          setLoading(false);
          setPhotos([]);
        }
        return;
      }

      try {
        const res = await fetch('/api/photos');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.photos || [];
          const filtered = list.filter((p) => {
            if (!p) return false;
            if (p.deleted === true || p.is_deleted === true) return false;
            const src = p.image || p.url;
            return typeof src === 'string' && src.length > 0;
          });
          if (isMounted) setPhotos(filtered);
        }
      } catch (e) {
        // ignore; show empty state
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="card">
        <div className="muted">Loading photos…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Party Photos</h2>
        <p className="muted">Sign in to view and share party photos!</p>
        <button type="button" onClick={signIn} className="tile tile-blue" style={{ height: 48, border: 'none' }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="card">
        <h2 style={{ margin: 0 }}>Party Photos</h2>
        <div className="muted">No photos yet. Be the first to share memories!</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ margin: 0 }}>Party Photos</h2>
      </div>
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 12,
          scrollSnapType: 'x mandatory',
          padding: 16,
        }}
      >
        {photos.map((photo, i) => {
          const src = photo.image || photo.url;
          const uploader = photo.uploaded_by?.full_name || photo.uploaded_by?.username || photo.uploader_name;
          const photoId = photo.id;
          const likeCount = photo.likes_count || 0;
          const isLiked = photo.is_liked || false;
          const isLiking = liking.has(photoId);
          if (hiddenIds.has(photoId)) return null;

          return (
            <div key={photoId} style={{ minWidth: 240, scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--ring)', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Party ${i + 1}`} onError={() => handleImageError(photoId)} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />

              {/* Like button overlay */}
              <button
                type="button"
                onClick={() => handleLike(photoId)}
                disabled={isLiking}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isLiked ? '#ff6b6b' : 'white',
                  cursor: isLiking ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {isLiking ? '⏳' : '❤️'}
              </button>

              {/* Like count */}
              {likeCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {likeCount}
                </div>
              )}

              {/* Uploader info */}
              {uploader && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '12px', fontWeight: '600' }}>by {uploader}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
