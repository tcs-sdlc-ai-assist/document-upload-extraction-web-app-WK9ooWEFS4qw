import React, { useState, useCallback } from 'react';
import type { DocumentMetadata } from '../types';
import { UploadStatus } from '../types';

interface DocumentCardProps {
  document: DocumentMetadata;
  onDelete?: (documentId: string) => void;
  headingLevel?: 2 | 3 | 4;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeLabel(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'PDF';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'text/plain':
      return 'TXT';
    default:
      return fileType.split('/').pop()?.toUpperCase() || 'Unknown';
  }
}

function getFileTypeColor(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'bg-error-100 text-error-700';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'bg-primary-100 text-primary-700';
    case 'text/plain':
      return 'bg-success-100 text-success-700';
    default:
      return 'bg-secondary-100 text-secondary-700';
  }
}

function getStatusBadge(status: UploadStatus): { label: string; className: string } {
  switch (status) {
    case UploadStatus.COMPLETE:
      return { label: 'Extracted', className: 'bg-success-100 text-success-700' };
    case UploadStatus.ERROR:
      return { label: 'Failed', className: 'bg-error-100 text-error-700' };
    case UploadStatus.EXTRACTING:
      return { label: 'Extracting...', className: 'bg-accent-100 text-accent-700' };
    case UploadStatus.UPLOADING:
      return { label: 'Uploading...', className: 'bg-primary-100 text-primary-700' };
    case UploadStatus.VALIDATING:
      return { label: 'Validating...', className: 'bg-secondary-100 text-secondary-700' };
    case UploadStatus.CLEANING:
      return { label: 'Cleaning...', className: 'bg-accent-100 text-accent-700' };
    default:
      return { label: 'Idle', className: 'bg-secondary-100 text-secondary-700' };
  }
}

const TEXT_PREVIEW_LENGTH = 300;

export function DocumentCard({ document, onDelete, headingLevel = 3 }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasExtractedText = document.extractedText && document.extractedText.trim().length > 0;
  const isTextLong = hasExtractedText && document.extractedText.length > TEXT_PREVIEW_LENGTH;
  const displayText = isExpanded
    ? document.extractedText
    : document.extractedText.slice(0, TEXT_PREVIEW_LENGTH);

  const fileTypeLabel = getFileTypeLabel(document.fileType);
  const fileTypeColor = getFileTypeColor(document.fileType);
  const statusBadge = getStatusBadge(document.status);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleCopyText = useCallback(async () => {
    if (!hasExtractedText) return;
    try {
      await navigator.clipboard.writeText(document.extractedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      const textArea = window.document.createElement('textarea');
      textArea.value = document.extractedText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      window.document.body.appendChild(textArea);
      textArea.select();
      try {
        window.document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Silently fail if copy is not supported
      }
      window.document.body.removeChild(textArea);
    }
  }, [document.extractedText, hasExtractedText]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      onDelete(document.id);
    } catch {
      setIsDeleting(false);
    }
  }, [onDelete, document.id]);

  const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

  return (
    <article
      className="rounded-lg border border-secondary-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      aria-label={`Document: ${document.fileName}`}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <HeadingTag className="truncate text-lg font-semibold text-secondary-900">
              {document.fileName}
            </HeadingTag>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${fileTypeColor}`}
              >
                {fileTypeLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 hover:text-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Delete document ${document.fileName}`}
            >
              {isDeleting ? (
                <svg
                  className="mr-1 h-4 w-4 animate-spin"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="mr-1 h-4 w-4"
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
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        {/* Metadata */}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-secondary-500">Size</dt>
            <dd className="font-medium text-secondary-700">{formatFileSize(document.fileSize)}</dd>
          </div>
          <div>
            <dt className="text-secondary-500">Uploaded</dt>
            <dd className="font-medium text-secondary-700">
              {formatDate(document.uploadTimestamp)}
            </dd>
          </div>
          <div>
            <dt className="text-secondary-500">Characters</dt>
            <dd className="font-medium text-secondary-700">
              {hasExtractedText ? document.extractedText.length.toLocaleString() : '0'}
            </dd>
          </div>
        </dl>

        {/* Extracted Text */}
        {hasExtractedText && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">Extracted Text</span>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label={`Copy extracted text from ${document.fileName}`}
              >
                {copySuccess ? (
                  <>
                    <svg
                      className="mr-1 h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-1 h-3.5 w-3.5"
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
                        d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div
              className="custom-scrollbar mt-2 max-h-64 overflow-y-auto rounded-md border border-secondary-200 bg-secondary-50 p-3"
              role="region"
              aria-label={`Extracted text from ${document.fileName}`}
              tabIndex={0}
            >
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-secondary-800">
                {displayText}
                {!isExpanded && isTextLong && '…'}
              </pre>
            </div>
            {isTextLong && (
              <button
                type="button"
                onClick={handleToggleExpand}
                className="mt-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-expanded={isExpanded}
                aria-controls={`text-content-${document.id}`}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* No text message */}
        {!hasExtractedText && document.status === UploadStatus.COMPLETE && (
          <div className="mt-4 rounded-md border border-secondary-200 bg-secondary-50 p-3">
            <p className="text-sm italic text-secondary-500">
              No text was extracted from this document.
            </p>
          </div>
        )}

        {/* Error state */}
        {document.status === UploadStatus.ERROR && (
          <div className="mt-4 rounded-md border border-error-200 bg-error-50 p-3">
            <p className="text-sm text-error-700">
              Text extraction failed for this document. You may try uploading it again.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default DocumentCard;