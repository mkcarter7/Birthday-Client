import PageHeader from '@/components/PageHeader';
import PropTypes from 'prop-types';

export default function GameDetailPage({ params }) {
  const { id } = params;
  return (
    <main className="page">
      <PageHeader title={`Game: ${id}`} subtitle="Demo game screen" />
      <div className="card">
        <p>This is where the {id} game will load.</p>
      </div>
    </main>
  );
}

GameDetailPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
