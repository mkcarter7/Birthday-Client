import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const demoGames = [
  { id: 'trivia', name: 'Party Trivia' },
  { id: 'memory', name: 'Photo Memory Match' },
];

export default function GamesPage() {
  return (
    <main className="page">
      <PageHeader title="Games" subtitle="Play games & earn points" />
      <div className="card">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {demoGames.map((g) => (
            <li key={g.id} style={{ marginBottom: 8 }}>
              <Link href={`/games/${g.id}`}>{g.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
