'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import PhotoCarousel from '@/components/PhotoCarousel';
import { PARTY_CONFIG, getPartyDisplayName, getPartyLocation, getPartyTheme } from '@/config/party';

const tiles = [
  { href: '/calendar', label: 'Add to Calendar', color: 'green', icon: '📅' },
  { href: '/sms', label: 'Share via SMS', color: 'blue', icon: '📞' },
  { href: '/qrcode', label: 'QR Code', color: 'purple', icon: '📱' },
  { href: '/live', label: 'Watch Live', color: 'blue', icon: '🔗' },
  { href: '/photos', label: 'Photos', color: 'pink', icon: '📷' },
  { href: '/gift', label: 'Send Gift', color: 'violet', icon: '🎁' },
  { href: '/registry', label: 'Registry', color: 'indigo', icon: '⭐' },
  { href: '/guestbook', label: 'Guest Book', color: 'teal', icon: '💬' },
  { href: '/timeline', label: 'Timeline', color: 'orange', icon: '🕑' },
  { href: '/location', label: 'Location', color: 'emerald', icon: '📍' },
  { href: '/games', label: 'Play Games & Earn Points', color: 'gold', icon: '🏆' },
  { href: '/rsvp', label: 'RSVP for Party', color: 'rose', icon: '👥' },
];

export default function Home() {
  const weatherDesc = 'Sunny';

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

  const getWeatherIcon = (desc) => {
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes('storm') || lowerDesc.includes('thunder')) return '⛈️';
    if (lowerDesc.includes('rain') || lowerDesc.includes('shower')) return '🌧️';
    if (lowerDesc.includes('drizzle')) return '🌦️';
    if (lowerDesc.includes('snow') || lowerDesc.includes('sleet')) return '❄️';
    if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) return '🌫️';
    if (lowerDesc.includes('partly cloudy') || lowerDesc.includes('partly cloud')) return '⛅';
    if (lowerDesc.includes('cloud') || lowerDesc.includes('overcast')) return '☁️';
    if (lowerDesc.includes('clear') || lowerDesc.includes('sunny')) return '☀️';
    if (lowerDesc.includes('wind')) return '💨';
    return '🌤️'; // Default/unknown
  };

  const weatherIcon = getWeatherIcon(weatherDesc);

  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero-title">{getPartyDisplayName()}</h1>
        <p className="hero-subtitle">{PARTY_CONFIG.welcomeMessage}</p>
      </section>

      <section className="info-cards">
        <div className="info-card">
          <span className="icn">📅</span>
          <div>
            <div className="info-label">Date</div>
            <div className="info-value">{PARTY_CONFIG.date}</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">⏰</span>
          <div>
            <div className="info-label">Time</div>
            <div className="info-value">{PARTY_CONFIG.time}</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">📍</span>
          <div>
            <div className="info-label">Location</div>
            <div className="info-value">{getPartyLocation()}</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">⭐</span>
          <div>
            <div className="info-label">Theme</div>
            <div className="info-value">{getPartyTheme()}</div>
          </div>
        </div>
      </section>

      <section className="countdown-weather-container">
        <div className="countdown card" style={{ textAlign: 'center' }}>
          <h2>Party Countdown</h2>
          <div className="countdown-body" style={{ color: PARTY_CONFIG.secondaryColor || '#8B5CF6' }}>
            🎉 The Party Has Begun!
          </div>
          <p className="muted">Hope you&apos;re having an amazing time!</p>
        </div>

        <div className="weather">
          <div className="weather-card">
            <div className="weather-icon">{weatherIcon}</div>
            <div className="weather-title">Party Day Weather</div>
            <div className="weather-temp">75°F</div>
            <div className="weather-desc">{weatherDesc}</div>
          </div>
        </div>
      </section>

      <section className="tile-grid">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`tile tile-${t.color} ${t.wide ? 'wide' : ''}`}>
            <span className="tile-icon" aria-hidden>
              {t.icon}
            </span>
            <span className="tile-label">{t.label}</span>
          </Link>
        ))}
      </section>

      <PhotoCarousel />

      <section className="thanks card" style={{ textAlign: 'center' }}>
        <h2>Thank You!</h2>
        <p>Ivy&apos;s 2nd birthday party was absolutely magical thanks to all of you! Your presence, gifts, and memories made this celebration unforgettable.</p>
        <p className="muted">Photos and memories from the party are now available in the gallery.</p>
      </section>
    </main>
  );
}
