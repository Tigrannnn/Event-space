import clientApi from '@/lib/client.api';
import { SafeUserData, UpdateUserData, MessageResponse } from '@event-space/shared';

export const usersApi = {
	getMe: () => clientApi.get<SafeUserData>('/users/me').then((res) => res.data),
	updateMe: (data: UpdateUserData) =>
		clientApi.patch<SafeUserData>('/users/me', data).then((res) => res.data),
	deleteMe: () => clientApi.delete<MessageResponse>('/users/me').then((res) => res.data),
};
