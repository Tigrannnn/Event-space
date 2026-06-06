export type ImageUploaderExistingItem = {
	kind: 'existing';
	id: string;
	url: string;
	publicId: string;
	order: number;
};

export type ImageUploaderFileItem = {
	kind: 'file';
	file: File;
	previewUrl: string;
	order: number;
};

export type ImageUploaderItem = ImageUploaderExistingItem | ImageUploaderFileItem;
