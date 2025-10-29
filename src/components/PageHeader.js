import Link from 'next/link';
import PropTypes from 'prop-types';

export default function PageHeader({ title, subtitle }) {
  return (
    <header style={{ margin: '8px 0 16px' }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>{title}</h2>
            {subtitle ? (
              <p className="muted" style={{ margin: '6px 0 0' }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <Link href="/" className="tile tile-blue" style={{ height: 40, padding: '0 12px', borderRadius: 10, display: 'inline-flex', alignItems: 'center' }}>
            ← Home
          </Link>
        </div>
      </div>
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

PageHeader.defaultProps = {
  subtitle: '',
};
