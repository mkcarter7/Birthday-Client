export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const { searchParams } = new URL(request.url);
  const party = searchParams.get('party');

  let url = `${base.replace(/\/$/, '')}/api/scores/`;
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
    const scores = Array.isArray(data) ? data : data?.scores || data?.results || [];
    return Response.json(scores);
  } catch (e) {
    return Response.json({ error: 'Scores service unavailable' }, { status: 502 });
  }
}

export async function POST(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/scores/`;

  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return Response.json(
        {
          error: 'Authentication required',
          details: 'No authorization header provided',
        },
        { status: 401 },
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorText;
      try {
        errorText = await res.text();
      } catch (e) {
        errorText = `Status ${res.status}`;
      }
      return Response.json(
        {
          error: `Failed to create score: ${res.status} ${errorText}`,
          status: res.status,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: `Scores service unavailable: ${e.message}` }, { status: 502 });
  }
}
