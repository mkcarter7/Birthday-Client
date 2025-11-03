'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import PageHeader from '@/components/PageHeader';
import PhotoCarousel from '@/components/PhotoCarousel';
import { useAuth } from '@/utils/context/authContext';
import { signIn } from '@/utils/auth';
import { PARTY_CONFIG, validatePartyConfig } from '@/config/party';

export default function PhotosPage() {
  const { user, userLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Get party configuration
  const configErrors = validatePartyConfig();

  useEffect(() => {
    // Create confetti animation on page load
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    // Use theme colors from party config, with fallback festive colors
    const confettiColors = [
      PARTY_CONFIG.secondaryColor || '#8B5CF6', // Purple
      PARTY_CONFIG.primaryColor || '#3B82F6', // Blue
      PARTY_CONFIG.accentColor || '#F59E0B', // Orange/Amber
      '#10B981', // Green
      '#EC4899', // Pink
      '#FBBF24', // Yellow
    ];

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: confettiColors,
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: confettiColors,
      });
    }, 250);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Add required party field
    formData.append('party', PARTY_CONFIG.id);

    setUploading(true);
    setMessage('');

    try {
      const token = await user.getIdToken(true);

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Photo uploaded successfully!');
        e.target.reset();
        // Refresh the page to show new photos
        window.location.reload();
      } else {
        setMessage(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (userLoading) {
    return (
      <main className="page">
        <PageHeader title="Party Photos" subtitle="Upload and browse shared memories" />
        <div className="card">
          <div className="muted">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <PageHeader title="Party Photos" subtitle="Upload and browse shared memories" />
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <h3>Sign in to upload photos</h3>
          <p>You need to sign in with Google to upload photos to the party gallery.</p>
          <button type="button" onClick={signIn} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader title="Party Photos" subtitle="Upload and browse shared memories" />
      <PhotoCarousel />

      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <h3>Upload a Photo</h3>
        {configErrors.length > 0 && (
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, border: '1px solid #f59e0b' }}>
            <strong>Setup Required:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              {configErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleUpload} style={{ display: 'grid', gap: 12 }}>
          <input type="file" name="image" accept="image/*" required style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <button type="submit" disabled={uploading} className="tile tile-purple" style={{ height: 48, border: 'none' }}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red', margin: 0 }}>{message}</p>}
      </div>

      <div className="card">
        <p>Browse photos in the gallery above or upload new ones here.</p>
      </div>
    </main>
  );
}
