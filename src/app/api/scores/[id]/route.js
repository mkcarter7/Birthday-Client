/* eslint-disable import/prefer-default-export */
export async function PATCH(request, { params }) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const { id } = params;
  const url = `${base.replace(/\/$/, '')}/api/scores/${id}/`;

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
      method: 'PATCH',
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
          error: `Failed to update score: ${res.status} ${errorText}`,
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
