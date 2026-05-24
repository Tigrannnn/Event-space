import { EnvKey } from '@event-space/shared';
import axios from 'axios';

const BASE_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';

const clientApi = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

clientApi.interceptors.request.use((config) => {
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
				await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
				return clientApi(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	},
);

export default clientApi;
