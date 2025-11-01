/* eslint-disable import/prefer-default-export */
export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/scores/my_scores/`;

  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const headers = {
      Authorization: authHeader,
    };

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return Response.json([]);
      }
      return Response.json({ error: 'Upstream error' }, { status: res.status });
    }

    const data = await res.json();
    const scores = Array.isArray(data) ? data : data?.scores || data?.results || [];
    return Response.json(scores);
  } catch (e) {
    return Response.json({ error: 'Scores service unavailable' }, { status: 502 });
  }
}
