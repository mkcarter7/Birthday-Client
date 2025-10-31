'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';

export default function PhotoCarousel() {
  const { user, userLoading } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Likes disabled
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  const handleImageError = (photoId) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(photoId);
      return next;
    });
  };

  // Likes disabled – no handler

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

  // Auto-scroll effect
  useEffect(() => {
    if (!photos.length) return;

    let isPaused = false;
    let container = null;
    let timeoutId = null;
    let mouseEnterHandler = null;
    let mouseLeaveHandler = null;

    // Wait a bit for DOM to be ready
    timeoutId = setTimeout(() => {
      container = scrollContainerRef.current;
      if (!container) return;

      const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }

        autoScrollIntervalRef.current = setInterval(() => {
          if (isPaused || !container) return;

          const { scrollWidth, clientWidth, scrollLeft } = container;
          // Scroll by 2 photos at a time (each photo is ~50% width, 2 photos = visible width)
          const scrollDistance = clientWidth; // Scroll by full visible width to show next 2 photos

          // Check if we've reached the end
          if (scrollLeft + clientWidth >= scrollWidth - 5) {
            // Scroll back to the beginning
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll to the next pair of photos
            container.scrollTo({ left: scrollLeft + scrollDistance, behavior: 'smooth' });
          }
        }, 3000); // Scroll every 3 seconds
      };

      mouseEnterHandler = () => {
        isPaused = true;
      };

      mouseLeaveHandler = () => {
        isPaused = false;
      };

      container.addEventListener('mouseenter', mouseEnterHandler);
      container.addEventListener('mouseleave', mouseLeaveHandler);
      startAutoScroll();
    }, 200); // Small delay to ensure DOM is ready

    // eslint-disable-next-line consistent-return
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (container && mouseEnterHandler && mouseLeaveHandler) {
        container.removeEventListener('mouseenter', mouseEnterHandler);
        container.removeEventListener('mouseleave', mouseLeaveHandler);
      }
    };
  }, [photos.length]);

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
        ref={scrollContainerRef}
        className="photo-carousel-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 12,
          scrollSnapType: 'x mandatory',
          padding: '0 16px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {photos.map((photo, i) => {
          const src = photo.image || photo.url;
          const uploader = photo.uploaded_by?.full_name || photo.uploaded_by?.username || photo.uploader_name;
          const photoId = photo.id;
          // Like UI removed
          if (hiddenIds.has(photoId)) return null;

          return (
            <div key={photoId} style={{ minWidth: 'calc((100% - 12px) / 2)', width: 'calc((100% - 12px) / 2)', flexShrink: 0, scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--ring)', position: 'relative' }} className="photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Party ${i + 1}`} onError={() => handleImageError(photoId)} style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />

              {/* Likes removed */}

              {/* Uploader info */}
              {uploader && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '12px', fontWeight: '600' }}>by {uploader}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
