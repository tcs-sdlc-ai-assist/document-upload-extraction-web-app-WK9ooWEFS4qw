import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../hooks/useDocuments';
import { ROUTES } from '../constants';
import { UploadStatus } from '../types';
import type { DocumentMetadata } from '../types';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, documentCount, loading } = useDocuments();

  const completedDocuments = documents.filter(
    (doc) => doc.status === UploadStatus.COMPLETE
  );
  const failedDocuments = documents.filter(
    (doc) => doc.status === UploadStatus.ERROR
  );

  const totalExtractedChars = completedDocuments.reduce(
    (sum, doc) => sum + (doc.extractedText?.length || 0),
    0
  );

  const totalFileSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  const recentDocuments = [...documents]
    .sort((a, b) => b.uploadTimestamp - a.uploadTimestamp)
    .slice(0, 5);

  const fileTypeCounts: Record<string, number> = {};
  documents.forEach((doc) => {
    const label = getFileTypeLabel(doc.fileType);
    fileTypeCounts[label] = (fileTypeCounts[label] || 0) + 1;
  });

  const greeting = user?.username
    ? `Welcome back, ${user.username}`
    : 'Welcome back';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-secondary-500">{greeting}</p>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-label="Loading dashboard data"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <span className="sr-only">Loading dashboard data…</span>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              Document Statistics
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Documents"
                value={documentCount.toString()}
                icon={
                  <svg
                    className="h-6 w-6 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                color="bg-primary-50"
              />
              <StatCard
                label="Successful Extractions"
                value={completedDocuments.length.toString()}
                icon={
                  <svg
                    className="h-6 w-6 text-success-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="bg-success-50"
              />
              <StatCard
                label="Failed Extractions"
                value={failedDocuments.length.toString()}
                icon={
                  <svg
                    className="h-6 w-6 text-error-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="bg-error-50"
              />
              <StatCard
                label="Total File Size"
                value={formatFileSize(totalFileSize)}
                icon={
                  <svg
                    className="h-6 w-6 text-accent-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                }
                color="bg-accent-50"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby="actions-heading">
            <h2
              id="actions-heading"
              className="text-lg font-semibold text-secondary-900"
            >
              Quick Actions
            </h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(ROUTES.UPLOAD)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload New Document
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.HISTORY)}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-5 py-2.5 text-sm font-medium text-secondary-700 shadow-sm transition-colors hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                View History
              </button>
            </div>
          </section>

          {/* File Type Breakdown */}
          {Object.keys(fileTypeCounts).length > 0 && (
            <section aria-labelledby="breakdown-heading">
              <h2
                id="breakdown-heading"
                className="text-lg font-semibold text-secondary-900"
              >
                File Type Breakdown
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(fileTypeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 shadow-sm"
                  >
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                        type === 'PDF'
                          ? 'bg-error-100 text-error-700'
                          : type === 'DOCX'
                            ? 'bg-primary-100 text-primary-700'
                            : type === 'TXT'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-secondary-100 text-secondary-700'
                      }`}
                    >
                      {type}
                    </span>
                    <span className="text-sm font-medium text-secondary-700">
                      {count} {count === 1 ? 'document' : 'documents'}
                    </span>
                  </div>
                ))}
              </div>
              {totalExtractedChars > 0 && (
                <p className="mt-2 text-sm text-secondary-500">
                  Total extracted text: {totalExtractedChars.toLocaleString()}{' '}
                  characters
                </p>
              )}
            </section>
          )}

          {/* Recent Uploads */}
          <section aria-labelledby="recent-heading">
            <h2
              id="recent-heading"
              className="text-lg font-semibold text-secondary-900"
            >
              Recent Uploads
            </h2>
            {recentDocuments.length === 0 ? (
              <div className="mt-3 rounded-lg border-2 border-dashed border-secondary-300 bg-white p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-secondary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H12.75V15zm0 3H9.75m3 0h.008v.008H12.75V18zM9.75 9h.008v.008H9.75V9zm0 3h.008v.008H9.75V12zm0 3h.008v.008H9.75V15z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-secondary-900">
                  No documents yet
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Upload your first document to get started.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.UPLOAD)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500"
                        >
                          File Name
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500"
                        >
                          Uploaded
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {recentDocuments.map((doc) => (
                        <RecentDocumentRow key={doc.id} document={doc} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {documents.length > 5 && (
                  <div className="border-t border-secondary-200 bg-secondary-50 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.HISTORY)}
                      className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 focus:outline-none focus:underline"
                    >
                      View all {documents.length} documents →
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-secondary-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-500">{label}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface RecentDocumentRowProps {
  document: DocumentMetadata;
}

function RecentDocumentRow({ document }: RecentDocumentRowProps) {
  const statusConfig: Record<
    UploadStatus,
    { label: string; className: string }
  > = {
    [UploadStatus.IDLE]: {
      label: 'Idle',
      className: 'bg-secondary-100 text-secondary-700',
    },
    [UploadStatus.VALIDATING]: {
      label: 'Validating',
      className: 'bg-primary-100 text-primary-700',
    },
    [UploadStatus.UPLOADING]: {
      label: 'Uploading',
      className: 'bg-primary-100 text-primary-700',
    },
    [UploadStatus.EXTRACTING]: {
      label: 'Extracting',
      className: 'bg-accent-100 text-accent-700',
    },
    [UploadStatus.CLEANING]: {
      label: 'Cleaning',
      className: 'bg-accent-100 text-accent-700',
    },
    [UploadStatus.COMPLETE]: {
      label: 'Complete',
      className: 'bg-success-100 text-success-700',
    },
    [UploadStatus.ERROR]: {
      label: 'Error',
      className: 'bg-error-100 text-error-700',
    },
  };

  const status = statusConfig[document.status] || statusConfig[UploadStatus.IDLE];

  return (
    <tr className="transition-colors hover:bg-secondary-50">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-secondary-900">
        <span className="max-w-[200px] truncate block" title={document.fileName}>
          {document.fileName}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${getFileTypeColor(document.fileType)}`}
        >
          {getFileTypeLabel(document.fileType)}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary-600">
        {formatFileSize(document.fileSize)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary-500">
        {formatDate(document.uploadTimestamp)}
      </td>
    </tr>
  );
}

export default DashboardPage;