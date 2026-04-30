import { cookies } from 'next/headers';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {}),
	};

	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers,
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}
