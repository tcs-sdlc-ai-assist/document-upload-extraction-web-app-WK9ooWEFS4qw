import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateFile } from '../services/FileValidator';
import {
  ACCEPT_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  SUPPORTED_FILE_EXTENSIONS,
} from '../constants';
import type { FileValidationResult } from '../types';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileAccepted, disabled = false }: FileDropzoneProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setValidationError(null);

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      const result: FileValidationResult = validateFile(file);

      if (!result.valid) {
        setValidationError(result.error);
        return;
      }

      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const onDropRejected = useCallback(() => {
    setValidationError(
      `Unsupported file type. Please upload one of: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`
    );
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT_FILE_TYPES,
    maxFiles: 1,
    disabled,
    multiple: false,
  });

  const borderColor = isDragReject
    ? 'border-error-500 bg-error-50'
    : isDragAccept
      ? 'border-success-500 bg-success-50'
      : isDragActive
        ? 'border-primary-500 bg-primary-50'
        : 'border-secondary-300 bg-white';

  const cursorStyle = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        role="button"
        aria-label="File upload dropzone. Drag and drop a file here or click to select a file."
        aria-disabled={disabled}
        tabIndex={0}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${borderColor} ${cursorStyle}`}
      >
        <input {...getInputProps()} aria-label="File input" />

        <svg
          className={`mb-4 h-12 w-12 ${isDragActive ? 'text-primary-500' : 'text-secondary-400'}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        {isDragActive ? (
          <p className="text-lg font-medium text-primary-600">
            Drop the file here...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-secondary-700">
              Drag & drop a file here, or click to select
            </p>
            <p className="mt-2 text-sm text-secondary-500">
              Supported formats: {SUPPORTED_FILE_EXTENSIONS.join(', ')} — Max size: {MAX_FILE_SIZE_MB}MB
            </p>
          </>
        )}
      </div>

      {validationError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 rounded-md bg-error-50 p-3 text-sm text-error-700 border border-error-200"
        >
          <span className="font-medium">Error:</span> {validationError}
        </div>
      )}
    </div>
  );
}

export default FileDropzone;