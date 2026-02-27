import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const apiVersion = '2025-02-06';

export const sanityConfig = {
	projectId: publicEnv.PUBLIC_SANITY_PROJECT_ID || 'd1ta6zzb',
	dataset: publicEnv.PUBLIC_SANITY_DATASET || 'production'
};

type QueryParams = Record<string, string | number | boolean | null>;

export async function sanityQuery<T>(
	fetchFn: typeof fetch,
	query: string,
	params: QueryParams = {}
): Promise<T> {
	const searchParams = new URLSearchParams();
	searchParams.set('query', query);
	searchParams.set('perspective', 'published');

	for (const [key, value] of Object.entries(params)) {
		searchParams.set(`$${key}`, JSON.stringify(value));
	}

	const url = `https://${sanityConfig.projectId}.api.sanity.io/v${apiVersion}/data/query/${sanityConfig.dataset}?${searchParams.toString()}`;
	const token = privateEnv.SANITY_API_READ_TOKEN?.trim();
	const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
	const response = await fetchFn(url, { headers });

	if (!response.ok) {
		const details = await response.text();
		const hint =
			(response.status === 401 || response.status === 403) && !token
				? ' Missing SANITY_API_READ_TOKEN for private dataset access.'
				: '';
		throw new Error(`Sanity query failed with status ${response.status}.${hint} ${details}`);
	}

	const payload = (await response.json()) as { result: T };
	return payload.result;
}
