import React, { useState, useCallback, useMemo } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { STATUS_MESSAGES } from '../constants';
import type { DocumentMetadata } from '../types';

export function HistoryPage() {
  const { documents, loading, deleteDocument, refreshDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach((doc) => {
      types.add(doc.fileType);
    });
    return Array.from(types).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(query) ||
          doc.fileType.toLowerCase().includes(query) ||
          doc.extractedText.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      result = result.filter((doc) => doc.fileType === filterType);
    }

    return result.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
  }, [documents, searchQuery, filterType]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterType(event.target.value);
    },
    []
  );

  const handleDelete = useCallback(
    (documentId: string) => {
      if (deleteConfirmId === documentId) {
        const success = deleteDocument(documentId);
        if (success) {
          setStatusMessage('Document deleted successfully.');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          setStatusMessage('An error occurred while deleting the document.');
          setTimeout(() => setStatusMessage(null), 3000);
        }
        setDeleteConfirmId(null);
      } else {
        setDeleteConfirmId(documentId);
        setTimeout(() => setDeleteConfirmId(null), 5000);
      }
    },
    [deleteConfirmId, deleteDocument]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setFilterType('all');
  }, []);

  const getFileTypeLabel = (mimeType: string): string => {
    switch (mimeType) {
      case 'application/pdf':
        return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'text/plain':
        return 'TXT';
      default:
        return mimeType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading documents">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-secondary-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Document History</h1>
          <p className="mt-1 text-sm text-secondary-500">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored
          </p>
        </div>
        <button
          type="button"
          onClick={refreshDocuments}
          className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm transition-colors hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Refresh document list"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {statusMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800"
        >
          {statusMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-secondary-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="search-documents" className="sr-only">
            Search documents
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-secondary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="search-documents"
            type="search"
            placeholder="Search by file name or content..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full rounded-lg border border-secondary-300 bg-white py-2 pl-10 pr-3 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search documents by file name or content"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="filter-type" className="sr-only">
            Filter by file type
          </label>
          <select
            id="filter-type"
            value={filterType}
            onChange={handleFilterChange}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-700 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter documents by file type"
          >
            <option value="all">All Types</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {getFileTypeLabel(type)}
              </option>
            ))}
          </select>

          {(searchQuery || filterType !== 'all') && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Clear search and filters"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {(searchQuery || filterType !== 'all') && (
        <p className="text-sm text-secondary-500" aria-live="polite">
          Showing {filteredDocuments.length} of {documents.length}{' '}
          {documents.length === 1 ? 'document' : 'documents'}
          {searchQuery && (
            <span>
              {' '}
              matching &ldquo;<span className="font-medium text-secondary-700">{searchQuery}</span>&rdquo;
            </span>
          )}
          {filterType !== 'all' && (
            <span>
              {' '}
              filtered by <span className="font-medium text-secondary-700">{getFileTypeLabel(filterType)}</span>
            </span>
          )}
        </p>
      )}

      {documents.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-secondary-300 bg-white px-6 py-16 text-center"
          role="status"
        >
          <svg
            className="mb-4 h-16 w-16 text-secondary-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="mb-2 text-lg font-semibold text-secondary-700">No Documents Yet</h2>
          <p className="max-w-sm text-sm text-secondary-500">{STATUS_MESSAGES.NO_DOCUMENTS}</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-secondary-300 bg-white px-6 py-16 text-center"
          role="status"
        >
          <svg
            className="mb-4 h-16 w-16 text-secondary-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="mb-2 text-lg font-semibold text-secondary-700">No Results Found</h2>
          <p className="max-w-sm text-sm text-secondary-500">
            No documents match your search criteria. Try adjusting your search or filters.
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <ul
          className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          role="list"
          aria-label="Document list"
        >
          {filteredDocuments.map((doc: DocumentMetadata) => (
            <li key={doc.id} role="listitem">
              <DocumentCard
                document={doc}
                onDelete={handleDelete}
                headingLevel={3}
              />
              {deleteConfirmId === doc.id && (
                <div
                  className="mt-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800"
                  role="alert"
                >
                  <p className="font-medium">Are you sure you want to delete this document?</p>
                  <p className="mt-1 text-error-600">
                    Click delete again to confirm, or wait for the confirmation to expire.
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;