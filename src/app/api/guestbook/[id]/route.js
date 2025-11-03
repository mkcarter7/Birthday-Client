export async function DELETE(request, { params }) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  // Await params if it's a Promise (Next.js 14+)
  const resolvedParams = await params;
  const url = `${base.replace(/\/$/, '')}/api/guestbook/${resolvedParams.id}/`;

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
      let errorText;
      try {
        errorText = await res.text();
        // Try to parse as JSON for better error message
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorJson.details || errorText;
        } catch {
          // Keep as text if not JSON
        }
      } catch (e) {
        errorText = `Status ${res.status}`;
      }

      console.error('Backend DELETE error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        url,
      });

      return Response.json(
        {
          error: `Failed to delete message: ${res.status}`,
          details: errorText,
          status: res.status,
        },
        { status: res.status },
      );
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: `Guestbook service unavailable: ${e.message}` }, { status: 502 });
  }
}

export async function PATCH(request, { params }) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  // Await params if it's a Promise (Next.js 14+)
  const resolvedParams = await params;
  const url = `${base.replace(/\/$/, '')}/api/guestbook/${resolvedParams.id}/`;

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
