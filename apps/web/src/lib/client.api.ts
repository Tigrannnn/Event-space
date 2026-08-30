import { EnvKey } from '@event-space/shared';
import axios from 'axios';

const SERVER_API_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';

/**
 * In the browser, call the API's public origin directly when one is published:
 * Next answers cross-host rewrites with a 301, and following it downgrades POST
 * to GET. The value is read from the document at request time rather than
 * inlined at build time, so it follows the deployment's environment instead of
 * whatever was set when the image happened to be built. Falls back to the /api
 * rewrite locally, where both apps share one host.
 */
const resolveBaseUrl = (): string => {
	if (typeof window === 'undefined') return SERVER_API_URL;
	return window.__PUBLIC_API_URL__ || '/api';
};

const clientApi = axios.create({
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

clientApi.interceptors.request.use((config) => {
	config.baseURL = resolveBaseUrl();

	if (config.data instanceof FormData) {
		// Let the browser set multipart boundary; a manual Content-Type breaks file uploads.
		if (config.headers && typeof config.headers.delete === 'function') {
			config.headers.delete('Content-Type');
		} else if (config.headers) {
			delete config.headers['Content-Type'];
			delete config.headers['content-type'];
		}
	}
	return config;
});

clientApi.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
		const isAuthRequest = originalRequest.url?.includes('/auth');

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!isRefreshRequest &&
			!isAuthRequest
		) {
			originalRequest._retry = true;
			try {
				await axios.post(`${resolveBaseUrl()}/auth/refresh`, {}, { withCredentials: true });
				return clientApi(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	},
);

export default clientApi;
