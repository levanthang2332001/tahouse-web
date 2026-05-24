import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `file-${uniqueSuffix}${ext}`);
  },
});

export const createFileFilter = (acceptedMimeTypes: string[]) => {
  return (
    req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file) {
      callback(new Error('File is required'), false);
      return;
    }

    if (!acceptedMimeTypes.includes(file.mimetype)) {
      callback(
        new Error(
          `Invalid file type. Accepted types: ${acceptedMimeTypes.join(', ')}`,
        ),
        false,
      );
      return;
    }

    callback(null, true);
  };
};
