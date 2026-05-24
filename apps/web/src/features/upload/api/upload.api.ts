import clientApi from '@/lib/client.api';

export const uploadApi = {
	uploadImage: async (file: File): Promise<{ url: string }> => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await clientApi.post<{ url: string }>('/upload/image', formData);

		return response.data;
	},
};
