export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/guestbook/`;

  try {
    // Handle both lowercase and capitalized Authorization header
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
      // Log 403 errors with details
      if (res.status === 403) {
        console.error('⚠️ Guestbook API - 403 Forbidden from backend:', {
          url,
          hasAuthHeader: !!authHeader,
          status: res.status,
        });
        // Still return empty array to prevent breaking the UI, but log the issue
        return Response.json([]);
      }
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('Guestbook API - Backend error:', {
        status: res.status,
        error: errorText,
        url,
      });
      return Response.json({ error: 'Upstream error', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    // Normalize to an array of message objects
    const messages = Array.isArray(data) ? data : data?.messages || data?.results || [];

    return Response.json(messages);
  } catch (e) {
    return Response.json({ error: 'Guestbook service unavailable' }, { status: 502 });
  }
}

export async function POST(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/guestbook/`;

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
      console.error('Guestbook POST - Error response:', errorText);
      // Include the full error response in the returned error
      return Response.json(
        {
          error: `Failed to add message: ${res.status} ${errorText}`,
          status: res.status,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    console.error('Guestbook POST - Exception:', e);
    return Response.json({ error: `Guestbook service unavailable: ${e.message}` }, { status: 502 });
  }
}
