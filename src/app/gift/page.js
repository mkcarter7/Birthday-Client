import PageHeader from '@/components/PageHeader';

export default function GiftPage() {
  return (
    <main className="page">
      <PageHeader title="Send Gift" subtitle="Options to contribute or send a present" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <p>Prefer to send a monetary gift? Use Venmo below:</p>
        <a href="venmo://pay?recipients=isabellaCarter_18" className="tile tile-violet" style={{ height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Open Venmo App (@isabellaCarter_18)
        </a>
        <a href="https://venmo.com/u/isabellaCarter_18" target="_blank" rel="noreferrer" className="tile tile-indigo" style={{ height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Open Venmo in Browser
        </a>
        <p className="muted" style={{ margin: 0 }}>
          Note: App link works best on mobile with Venmo installed.
        </p>
      </div>
    </main>
  );
}
