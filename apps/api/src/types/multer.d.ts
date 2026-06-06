import type { File } from 'multer';

declare global {
	namespace Express {
		namespace Multer {
			type File = import('multer').File;
		}
	}
}

export {};
