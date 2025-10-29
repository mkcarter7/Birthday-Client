import PageHeader from '@/components/PageHeader';

export default function PhotosPage() {
  return (
    <main className="page">
      <PageHeader title="Party Photos" subtitle="Upload and browse shared memories" />
      <div className="card">
        <p>No photos uploaded yet. Be the first to share memories!</p>
      </div>
    </main>
  );
}
