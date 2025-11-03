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

    console.log('Guestbook API GET - Making request to:', url);
    console.log('Guestbook API GET - Headers:', {
      hasAuth: !!authHeader,
      authPreview: authHeader ? `${authHeader.substring(0, 30)}...` : 'none',
    });

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    console.log('Guestbook API GET - Response status:', res.status, res.statusText);

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

    // Debug logging
    console.log('Guestbook API - Backend returned:', {
      isArray: Array.isArray(data),
      messageCount: messages.length,
      firstMessage: messages[0] || null,
      allData: data,
    });

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
    console.log('Guestbook POST - Request body:', body);
    console.log('Guestbook POST - Name in request:', body.name);
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    console.log('Guestbook POST - URL:', url);
    console.log('Guestbook POST - Auth header received:', authHeader ? 'Yes' : 'No');
    if (authHeader) {
      console.log('Guestbook POST - Auth header preview:', `${authHeader.substring(0, 50)}...`);
      console.log('Guestbook POST - Auth header starts with Bearer:', authHeader.startsWith('Bearer '));
      // Extract token if Bearer format
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Guestbook POST - Token length:', token.length);
        // Check token structure (JWT has 3 parts separated by dots)
        const tokenParts = token.split('.');
        console.log('Guestbook POST - Token parts:', tokenParts.length);
        if (tokenParts.length === 3) {
          try {
            // Decode base64 URL-safe encoding
            const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
            // Add padding if needed
            const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
            // Decode using atob (works in Node.js and browser)
            const payloadJson = Buffer.from(padded, 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            console.log('Guestbook POST - Token payload:', {
              iss: payload.iss,
              aud: payload.aud,
              exp: payload.exp,
              iat: payload.iat,
              expDate: new Date(payload.exp * 1000).toISOString(),
              nowDate: new Date().toISOString(),
              expired: payload.exp < Math.floor(Date.now() / 1000),
              user_id: payload.user_id || payload.sub,
              email: payload.email,
            });
          } catch (e) {
            console.warn('Guestbook POST - Could not decode token payload:', e.message);
            console.warn('Guestbook POST - Decode error stack:', e.stack);
          }
        } else {
          console.warn('Guestbook POST - Token does not have 3 parts, invalid JWT structure');
        }
      } else {
        console.warn('Guestbook POST - Auth header does not start with "Bearer "');
      }
    }

    if (!authHeader) {
      console.warn('Guestbook POST - No authorization header provided');
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

    console.log('Guestbook POST - Headers being sent:', {
      'Content-Type': headers['Content-Type'],
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 30)}...` : 'None',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Guestbook POST - Response headers received:', Object.fromEntries(res.headers.entries()));

    console.log('Guestbook POST - Response status:', res.status);

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
    console.log('Guestbook POST - Success response:', data);
    console.log('Guestbook POST - Response name fields:', {
      name: data.name,
      author_name: data.author_name,
      author: data.author,
      full_name: data.full_name,
      username: data.username,
    });
    return Response.json(data);
  } catch (e) {
    console.error('Guestbook POST - Exception:', e);
    return Response.json({ error: `Guestbook service unavailable: ${e.message}` }, { status: 502 });
  }
}
