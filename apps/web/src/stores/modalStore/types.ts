export enum ModalType {
	Register = 'register',
	Login = 'login',
	VerifyEmail = 'verifyEmail',
	ForgotPassword = 'forgotPassword',
	ImagePreview = 'imagePreview',
	Confirm = 'confirm',
	EditProfile = 'edit-profile',
}

export interface ImagePreviewData {
	images: string[];
	initialIndex?: number;
}

export interface VerifyEmailModalData {
	email: string;
}

export interface ForgotPasswordModalData {
	email?: string;
}

export interface ConfirmModalData {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'primary';
	onConfirm: () => void;
	onCancel?: () => void;
}

export interface ModalDataMap {
	[ModalType.Register]: null;
	[ModalType.Login]: null;
	[ModalType.VerifyEmail]: VerifyEmailModalData;
	[ModalType.ForgotPassword]: ForgotPasswordModalData | null;
	[ModalType.ImagePreview]: ImagePreviewData;
	[ModalType.Confirm]: ConfirmModalData;
	[ModalType.EditProfile]: null;
}

export interface ModalState {
	activeModal: ModalType | null;
	modalData: ModalDataMap[keyof ModalDataMap] | null;
}

export interface ModalActions {
	openModal: <T extends ModalType>(
		...args: ModalDataMap[T] extends null ? [modalType: T] : [modalType: T, data: ModalDataMap[T]]
	) => void;
	closeModal: () => void;
}

export type ModalStore = ModalState & ModalActions;
