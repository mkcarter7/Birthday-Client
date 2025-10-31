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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  // Check scroll position to enable/disable arrows
  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollWidth, clientWidth, scrollLeft } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // Scroll handlers
  const handleScrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { clientWidth, scrollLeft: currentScroll } = container;
    // Cards are calc((100% - 12px) / 2), so 2 cards + gap = clientWidth
    const scrollDistance = clientWidth;

    const newScrollLeft = Math.max(0, currentScroll - scrollDistance);
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollWidth, clientWidth, scrollLeft: currentScroll } = container;
    // Cards are calc((100% - 12px) / 2), so 2 cards + gap = clientWidth
    const scrollDistance = clientWidth;

    const newScrollLeft = Math.min(scrollWidth - clientWidth, currentScroll + scrollDistance);
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  // Touch/swipe handlers
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const handleSwipe = () => {
    const swipeDistance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handleScrollRight(); // Swipe left = scroll right
      } else {
        handleScrollLeft(); // Swipe right = scroll left
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndXRef.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  // Update scroll buttons on scroll and resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !photos.length) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    // eslint-disable-next-line consistent-return
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
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
        <p className="muted">Sign in to view and share party photos!</p>
        <button type="button" onClick={signIn} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="card">
        <div className="muted">No photos yet. Be the first to share memories!</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'transparent', padding: 0 }}>
      <div style={{ position: 'relative', padding: '0 16px', overflow: 'hidden' }}>
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={handleScrollLeft}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontSize: '20px',
            }}
            aria-label="Scroll left"
          >
            ←
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={handleScrollRight}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontSize: '20px',
            }}
            aria-label="Scroll right"
          >
            →
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="photo-carousel-scroll"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 12,
            scrollSnapType: 'x mandatory',
            padding: 0,
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
              <div key={photoId} style={{ minWidth: 'calc((100% - 12px) / 2)', width: 'calc((100% - 12px) / 2)', maxWidth: 'calc((100% - 12px) / 2)', flexShrink: 0, scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--ring)', position: 'relative' }} className="photo-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Party ${i + 1}`} onError={() => handleImageError(photoId)} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />

                {/* Likes removed */}

                {/* Uploader info */}
                {uploader && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '12px', fontWeight: '600' }}>by {uploader}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
