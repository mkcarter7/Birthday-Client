export async function DELETE(request, { params }) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/guestbook/${params.id}/`;

  try {
    // Handle both lowercase and capitalized Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const headers = {
      Authorization: authHeader,
    };

    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return Response.json({ error: `Failed to delete message: ${res.status} ${errorText}` }, { status: res.status });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: `Guestbook service unavailable: ${e.message}` }, { status: 502 });
  }
}

export async function PATCH(request, { params }) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/guestbook/${params.id}/`;

  try {
    const body = await request.json();
    // Handle both lowercase and capitalized Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
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
      const errorText = await res.text();
      return Response.json({ error: `Failed to update message: ${res.status} ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: `Guestbook service unavailable: ${e.message}` }, { status: 502 });
  }
}
