import PageHeader from '@/components/PageHeader';

export default function QrPage() {
  return (
    <main className="page">
      <PageHeader title="QR Code" subtitle="Display or download the party QR code" />
      <div className="card">
        <p>A QR code for guests to quickly open the party site. Generator coming soon.</p>
      </div>
    </main>
  );
}
