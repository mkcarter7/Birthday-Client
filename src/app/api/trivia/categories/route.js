/* eslint-disable import/prefer-default-export */
export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/trivia/categories/`;

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
    const categories = Array.isArray(data) ? data : data?.categories || [];
    return Response.json(categories);
  } catch (e) {
    return Response.json({ error: 'Categories service unavailable' }, { status: 502 });
  }
}
