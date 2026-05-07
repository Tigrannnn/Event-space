import { cookies } from 'next/headers';
import { EnvKey } from '@event-space/shared';

const BASE_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';

export async function serverFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();

  const getCookieHeader = () =>
    cookieStore.getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join('; ');

  const makeRequest = (cookieHeader: string) => {
    const accessToken = cookieStore.get('accessToken')?.value;
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(new Headers(options.headers)),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });
  };

  let res = await makeRequest(getCookieHeader());

  if (res.status === 401 && !endpoint.startsWith('/auth')) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: getCookieHeader() },
      cache: 'no-store',
    });

    if (!refreshRes.ok) throw new Error('Refresh failed');

    const setCookies = refreshRes.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      cookieStore.set(name.trim(), value.trim());
    }

    res = await makeRequest(getCookieHeader());
  }

  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}