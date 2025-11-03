// Firebase auth is now handled on the client-side

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/photos/`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return Response.json({ error: 'Upstream error' }, { status: res.status });
    }
    const data = await res.json();
    // Normalize to an array of photo objects
    const photos = Array.isArray(data) ? data : data?.photos || data?.results || [];
    return Response.json(photos);
  } catch (e) {
    return Response.json({ error: 'Photos service unavailable' }, { status: 502 });
  }
}

export async function POST(request) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/photos/`;

  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');

    const headers = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      // Don't set Content-Type for FormData - let browser set it with boundary
    });

    if (!res.ok) {
      const errorText = await res.text();
      return Response.json({ error: `Upload failed: ${res.status} ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    console.error('Upload error:', e);
    return Response.json({ error: `Upload service unavailable: ${e.message}` }, { status: 502 });
  }
}
