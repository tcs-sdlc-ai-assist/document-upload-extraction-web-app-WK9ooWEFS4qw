import React from 'react';
import { UploadStatus } from '../types';

interface UploadProgressProps {
  status: UploadStatus;
  fileName?: string;
}

const STAGE_CONFIG: Record<UploadStatus, { label: string; progress: number; color: string; bgColor: string }> = {
  [UploadStatus.IDLE]: {
    label: 'Ready to upload',
    progress: 0,
    color: 'bg-secondary-300',
    bgColor: 'bg-secondary-100',
  },
  [UploadStatus.VALIDATING]: {
    label: 'Validating file...',
    progress: 15,
    color: 'bg-primary-400',
    bgColor: 'bg-primary-50',
  },
  [UploadStatus.UPLOADING]: {
    label: 'Uploading file...',
    progress: 35,
    color: 'bg-primary-500',
    bgColor: 'bg-primary-50',
  },
  [UploadStatus.EXTRACTING]: {
    label: 'Extracting text...',
    progress: 60,
    color: 'bg-primary-600',
    bgColor: 'bg-primary-50',
  },
  [UploadStatus.CLEANING]: {
    label: 'Cleaning extracted text...',
    progress: 85,
    color: 'bg-primary-700',
    bgColor: 'bg-primary-50',
  },
  [UploadStatus.COMPLETE]: {
    label: 'Processing complete!',
    progress: 100,
    color: 'bg-success-500',
    bgColor: 'bg-success-50',
  },
  [UploadStatus.ERROR]: {
    label: 'An error occurred',
    progress: 100,
    color: 'bg-error-500',
    bgColor: 'bg-error-50',
  },
};

export function UploadProgress({ status, fileName }: UploadProgressProps): React.ReactElement | null {
  if (status === UploadStatus.IDLE) {
    return null;
  }

  const config = STAGE_CONFIG[status];
  const isProcessing = status !== UploadStatus.COMPLETE && status !== UploadStatus.ERROR;
  const isComplete = status === UploadStatus.COMPLETE;
  const isError = status === UploadStatus.ERROR;

  return (
    <div
      className={`w-full rounded-lg border p-4 ${
        isError
          ? 'border-error-200 bg-error-50'
          : isComplete
            ? 'border-success-200 bg-success-50'
            : 'border-primary-200 bg-primary-50'
      }`}
    >
      {fileName && (
        <p className="mb-2 text-sm font-medium text-secondary-700 truncate">
          {fileName}
        </p>
      )}

      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-medium ${
            isError
              ? 'text-error-700'
              : isComplete
                ? 'text-success-700'
                : 'text-primary-700'
          }`}
          aria-live="polite"
        >
          {config.label}
        </span>
        <span
          className={`text-sm font-medium ${
            isError
              ? 'text-error-600'
              : isComplete
                ? 'text-success-600'
                : 'text-primary-600'
          }`}
        >
          {config.progress}%
        </span>
      </div>

      <div
        className="w-full h-3 rounded-full bg-secondary-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={config.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${config.label}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-in-out ${config.color} ${
            isProcessing ? 'animate-pulse' : ''
          }`}
          style={{ width: `${config.progress}%` }}
        />
      </div>

      {isProcessing && (
        <div className="mt-2 flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs text-secondary-500">Processing...</span>
        </div>
      )}

      {isComplete && (
        <div className="mt-2 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-success-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-success-700">Document processed successfully</span>
        </div>
      )}

      {isError && (
        <div className="mt-2 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-error-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs text-error-700">Please try again or upload a different file</span>
        </div>
      )}
    </div>
  );
}

export default UploadProgress;