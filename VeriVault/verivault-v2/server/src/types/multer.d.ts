declare module 'multer' {
  import { Request } from 'express';

  namespace multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }

    interface Options {
      storage?: StorageEngine;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      fileFilter?: (
        req: Request,
        file: File,
        callback: (error: Error | null, acceptFile?: boolean) => void
      ) => void;
    }

    interface StorageEngine {
      _handleFile(
        req: Request,
        file: File,
        callback: (error?: any, info?: Partial<File>) => void
      ): void;
      _removeFile(
        req: Request,
        file: File,
        callback: (error: Error | null) => void
      ): void;
    }

    interface DiskStorageOptions {
      destination?: (
        req: Request,
        file: File,
        callback: (error: Error | null, destination: string) => void
      ) => void;
      filename?: (
        req: Request,
        file: File,
        callback: (error: Error | null, filename: string) => void
      ) => void;
    }

    function diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  interface Request {
    files?: multer.File[] | { [fieldname: string]: multer.File[] };
  }

  function multer(options?: multer.Options): any;

  export = multer;
} 