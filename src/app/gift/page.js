import PageHeader from '@/components/PageHeader';
import { PARTY_CONFIG } from '@/config/party';

export default function GiftPage() {
  return (
    <main className="page">
      <PageHeader title="Send Gift" subtitle="Options to contribute or send a present" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <p>{PARTY_CONFIG.giftMessage}</p>
        <a href={`venmo://pay?recipients=${PARTY_CONFIG.venmoUsername}`} className="tile tile-violet" style={{ height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Open Venmo App (@{PARTY_CONFIG.venmoUsername})
        </a>
        <a href={`https://venmo.com/u/${PARTY_CONFIG.venmoUsername}`} target="_blank" rel="noreferrer" className="tile tile-indigo" style={{ height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Open Venmo in Browser
        </a>
        <p className="muted" style={{ margin: 0 }}>
          Note: App link works best on mobile with Venmo installed.
        </p>
      </div>
    </main>
  );
}
