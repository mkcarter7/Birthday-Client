import PageHeader from '@/components/PageHeader';

export default function RegistryPage() {
  return (
    <main className="page">
      <PageHeader title="Registry" subtitle="View Ivy's wishlist and registry links" />
      <div className="card">
        <p>Add links to Amazon, Target, or custom registry items here.</p>
      </div>
    </main>
  );
}
