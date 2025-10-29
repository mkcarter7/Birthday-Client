'use client';

import Link from 'next/link';

const tiles = [
  { href: '/calendar', label: 'Add to Calendar', color: 'green', icon: '📅' },
  { href: '/sms', label: 'Share via SMS', color: 'blue', icon: '📞' },
  { href: '/qrcode', label: 'QR Code', color: 'purple', icon: '� QR' },
  { href: '/live', label: 'Watch Live', color: 'blue', icon: '🔗' },
  { href: '/photos', label: 'Photos', color: 'pink', icon: '📷' },
  { href: '/gift', label: 'Send Gift', color: 'violet', icon: '🎁' },
  { href: '/registry', label: 'Registry', color: 'indigo', icon: '⭐' },
  { href: '/guestbook', label: 'Guest Book', color: 'teal', icon: '💬' },
  { href: '/timeline', label: 'Timeline', color: 'orange', icon: '🕑' },
  { href: '/location', label: 'Location', color: 'emerald', icon: '📍' },
  { href: '/games', label: 'Play Games & Earn Points', color: 'gold', icon: '🏆', wide: true },
  { href: '/rsvp', label: 'RSVP for Party', color: 'rose', icon: '👥', wide: true },
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-icon">🎂</div>
        <h1 className="hero-title">Ivy&apos;s 2nd Birthday</h1>
        <p className="hero-subtitle">Join us for an unforgettable celebration!</p>
      </section>

      <section className="info-cards">
        <div className="info-card">
          <span className="icn">📅</span>
          <div>
            <div className="info-label">Date</div>
            <div className="info-value">2025-08-15</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">⏰</span>
          <div>
            <div className="info-label">Time</div>
            <div className="info-value">7:00 PM - 11:00 PM</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">📍</span>
          <div>
            <div className="info-label">Location</div>
            <div className="info-value">Rooftop Garden Venue, 123 Party Street, New York, NY</div>
          </div>
        </div>
        <div className="info-card">
          <span className="icn">⭐</span>
          <div>
            <div className="info-label">Theme</div>
            <div className="info-value">Enchanted Garden</div>
          </div>
        </div>
      </section>

      <section className="weather">
        <div className="weather-card">
          <div className="weather-title">Party Day Weather</div>
          <div className="weather-temp">75°F</div>
          <div className="weather-desc">Sunny</div>
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

      <section className="countdown card">
        <h2>Party Countdown</h2>
        <div className="countdown-body">🎉 The Party Has Begun!</div>
        <p className="muted">Hope you&apos;re having an amazing time!</p>
      </section>

      <section className="thanks card">
        <h2>Thank You!</h2>
        <p>Ivy&apos;s 2nd birthday party was absolutely magical thanks to all of you! Your presence, gifts, and memories made this celebration unforgettable.</p>
        <p className="muted">Photos and memories from the party are now available in the gallery.</p>
      </section>
    </main>
  );
}
