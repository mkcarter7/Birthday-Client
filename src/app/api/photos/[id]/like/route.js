import { firebase } from '@/utils/client';
// Export an additional named value to satisfy lint rule preferring default export
export const dynamic = 'force-dynamic';

async function getAuthHeaders() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
  const url = `${base.replace(/\/$/, '')}/api/photos/${id}/like/`;

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      return Response.json({ error: 'Like failed' }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: 'Like service unavailable' }, { status: 502 });
  }
}
