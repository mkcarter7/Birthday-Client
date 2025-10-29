import PageHeader from '@/components/PageHeader';

export default function TimelinePage() {
  return (
    <main className="page">
      <PageHeader title="Timeline" subtitle="Schedule and party highlights" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Party Schedule</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {[
            { time: '6:30 PM', title: 'Doors Open & Check‑in', icon: '🚪' },
            { time: '7:00 PM', title: 'Happy Birthday Toast for Ivy', icon: '🥂' },
            { time: '7:30 PM', title: 'Dinner is Served', icon: '🍽️' },
            { time: '8:15 PM', title: 'Games & Photo Booth', icon: '🎯' },
            { time: '9:00 PM', title: 'Cake Cutting', icon: '🎂' },
            { time: '9:30 PM', title: 'Dancing', icon: '🕺' },
            { time: '10:45 PM', title: 'Farewell & Party Favors', icon: '🎁' },
          ].map((item) => (
            <li key={item.time} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 64, fontWeight: 700 }}>{item.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ margin: 0 }}>
          Times are approximate and subject to change.
        </p>
      </div>
    </main>
  );
}
