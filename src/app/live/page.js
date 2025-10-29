import PageHeader from '@/components/PageHeader';

export default function LivePage() {
  return (
    <main className="page">
      <PageHeader title="Watch Live" subtitle="Join the livestream during the party" />
      <div className="card">
        <p>Embed a live video player here (YouTube Live, Twitch, etc.).</p>
      </div>
    </main>
  );
}
