/* eslint-disable import/prefer-default-export */
export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const { searchParams } = new URL(request.url);
  const party = searchParams.get('party');

  let url = `${base.replace(/\/$/, '')}/api/scores/leaderboard/`;
  if (party) {
    url += `?party=${party}`;
  }

  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    const headers = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 403) {
        return Response.json([]);
      }
      return Response.json({ error: 'Upstream error' }, { status: res.status });
    }

    const data = await res.json();
    const leaderboard = Array.isArray(data) ? data : data?.leaderboard || data?.results || [];
    return Response.json(leaderboard);
  } catch (e) {
    return Response.json({ error: 'Leaderboard service unavailable' }, { status: 502 });
  }
}
