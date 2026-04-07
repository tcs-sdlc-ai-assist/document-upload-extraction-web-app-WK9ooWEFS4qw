import React, { useState, useCallback } from 'react';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgress } from '../components/UploadProgress';
import { StatusBar, useStatusMessages } from '../components/StatusBar';
import { DocumentCard } from '../components/DocumentCard';
import { useDocuments } from '../hooks/useDocuments';
import type { DocumentMetadata } from '../types';
import { UploadStatus } from '../types';
import { STATUS_MESSAGES } from '../constants';

export function UploadPage() {
  const {
    uploadDocument,
    uploadStatus,
    deleteDocument,
    error,
    clearError,
  } = useDocuments();

  const { messages, addMessage, dismissMessage } = useStatusMessages();
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentMetadata[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileAccepted = useCallback(
    async (file: File) => {
      setCurrentFileName(file.name);
      setIsProcessing(true);
      clearError();

      try {
        const result = await uploadDocument(file);

        if (result) {
          setUploadedDocuments((prev) => [result, ...prev]);
          addMessage(STATUS_MESSAGES.UPLOAD_SUCCESS, 'success');
        } else {
          addMessage(error || STATUS_MESSAGES.UPLOAD_ERROR, 'error');
        }
      } catch (_err) {
        addMessage(STATUS_MESSAGES.UPLOAD_ERROR, 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [uploadDocument, addMessage, clearError, error],
  );

  const handleDeleteDocument = useCallback(
    (documentId: string) => {
      const success = deleteDocument(documentId);
      if (success) {
        setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        addMessage(STATUS_MESSAGES.DELETE_SUCCESS, 'success');
      } else {
        addMessage(STATUS_MESSAGES.DELETE_ERROR, 'error');
      }
    },
    [deleteDocument, addMessage],
  );

  const isUploading =
    isProcessing ||
    uploadStatus === UploadStatus.VALIDATING ||
    uploadStatus === UploadStatus.UPLOADING ||
    uploadStatus === UploadStatus.EXTRACTING ||
    uploadStatus === UploadStatus.CLEANING;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Upload Document
        </h1>
        <p className="mt-1 text-sm text-secondary-600">
          Upload a PDF, DOCX, or TXT file to extract its text content. Files up
          to 10MB are supported.
        </p>
      </div>

      <StatusBar messages={messages} onDismiss={dismissMessage} />

      <section
        aria-label="File upload area"
        className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-secondary-800">
          Select a File
        </h2>
        <FileDropzone
          onFileAccepted={handleFileAccepted}
          disabled={isUploading}
        />
      </section>

      {(isUploading || uploadStatus === UploadStatus.COMPLETE || uploadStatus === UploadStatus.ERROR) && (
        <section
          aria-label="Upload progress"
          className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
        >
          <UploadProgress status={uploadStatus} fileName={currentFileName} />
        </section>
      )}

      {uploadedDocuments.length > 0 && (
        <section aria-label="Extraction results">
          <h2 className="mb-4 text-lg font-semibold text-secondary-800">
            Extraction Results
          </h2>
          <div className="space-y-4">
            {uploadedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      )}

      {uploadedDocuments.length === 0 && !isUploading && (
        <div
          className="rounded-lg border border-dashed border-secondary-300 bg-white p-8 text-center"
          role="status"
        >
          <p className="text-sm text-secondary-500">
            No documents uploaded yet. Use the dropzone above to upload your
            first document.
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadPage;