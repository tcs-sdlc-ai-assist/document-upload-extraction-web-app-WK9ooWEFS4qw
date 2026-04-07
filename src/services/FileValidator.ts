import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  SUPPORTED_MIME_TYPE_LIST,
  SUPPORTED_FILE_EXTENSIONS,
  STATUS_MESSAGES,
} from '../constants';
import type { FileValidationResult } from '../types';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided.',
      file: null,
    };
  }

  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  const isExtensionSupported = (SUPPORTED_FILE_EXTENSIONS as readonly string[]).includes(extension);
  const isMimeTypeSupported = SUPPORTED_MIME_TYPE_LIST.includes(mimeType);

  if (!isExtensionSupported && !isMimeTypeSupported) {
    return {
      valid: false,
      error: STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE,
      file: null,
    };
  }

  if (!isExtensionSupported && isMimeTypeSupported) {
    return {
      valid: false,
      error: STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE,
      file: null,
    };
  }

  if (isExtensionSupported && !isMimeTypeSupported && mimeType !== '' && mimeType !== 'application/octet-stream') {
    return {
      valid: false,
      error: STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE,
      file: null,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: STATUS_MESSAGES.FILE_TOO_LARGE,
      file: null,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please upload a file with content.',
      file: null,
    };
  }

  return {
    valid: true,
    error: null,
    file,
  };
}

export const FileValidator = {
  validateFile,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_EXTENSIONS: SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_MIME_TYPES: SUPPORTED_MIME_TYPE_LIST,
} as const;

export default FileValidator;