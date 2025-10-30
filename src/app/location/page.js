import PageHeader from '@/components/PageHeader';
import { PARTY_CONFIG } from '@/config/party';

export default function LocationPage() {
  return (
    <main className="page">
      <PageHeader title="Location" subtitle="Directions and parking information" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Venue</div>
        <div>{PARTY_CONFIG.location}</div>
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          <iframe title="Google Map" width="100%" height="320" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(PARTY_CONFIG.location)}&output=embed`} />
        </div>
        <a className="tile tile-green" style={{ height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PARTY_CONFIG.location)}`} target="_blank" rel="noreferrer">
          Open in Google Maps
        </a>
      </div>
    </main>
  );
}
