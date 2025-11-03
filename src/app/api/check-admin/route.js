/* eslint-disable import/prefer-default-export */
export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/check-admin/`;

  try {
    // Handle both lowercase and capitalized Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return Response.json({ error: 'Authentication required', is_admin: false }, { status: 401 });
    }

    const headers = {
      Authorization: authHeader,
    };

    const res = await fetch(url, {
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('Check Admin - Error response:', {
        status: res.status,
        error: errorText,
      });
      return Response.json(
        {
          error: `Failed to check admin status: ${res.status}`,
          details: errorText,
          is_admin: false,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    console.error('Check Admin - Exception:', e);
    return Response.json(
      {
        error: `Admin check service unavailable: ${e.message}`,
        is_admin: false,
      },
      { status: 502 },
    );
  }
}
