import PageHeader from '@/components/PageHeader';

export default function SmsPage() {
  return (
    <main className="page">
      <PageHeader title="Share via SMS" subtitle="Send invites with a prefilled message" />
      <div className="card">
        <p>Here you can copy a short link and message to share the party details via SMS.</p>
      </div>
    </main>
  );
}
