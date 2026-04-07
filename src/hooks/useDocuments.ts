import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DocumentProcessor } from '../services/DocumentProcessor';
import {
  getDocuments,
  deleteDocument as deleteDoc,
  getDocumentCount,
} from '../services/StorageRepository';
import { retryExtraction as retryExtractionStrategy } from '../services/ExtractorStrategy';
import { cleanText } from '../services/TextCleaner';
import { updateDocument } from '../services/StorageRepository';
import type { DocumentMetadata } from '../types';
import { UploadStatus } from '../types';
import { STATUS_MESSAGES } from '../constants';

interface UseDocumentsReturn {
  documents: DocumentMetadata[];
  loading: boolean;
  error: string | null;
  uploadStatus: UploadStatus;
  documentCount: number;
  uploadDocument: (file: File) => Promise<DocumentMetadata | null>;
  deleteDocument: (documentId: string) => boolean;
  refreshDocuments: () => void;
  retryExtraction: (documentId: string) => Promise<DocumentMetadata | null>;
  clearError: () => void;
}

export function useDocuments(): UseDocumentsReturn {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [documentCount, setDocumentCount] = useState<number>(0);

  const userId = user?.id ?? '';

  const refreshDocuments = useCallback(() => {
    if (!isAuthenticated || !userId) {
      setDocuments([]);
      setDocumentCount(0);
      return;
    }

    try {
      const docs = getDocuments(userId);
      const sorted = [...docs].sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
      setDocuments(sorted);
      setDocumentCount(getDocumentCount(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load documents.';
      setError(message);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const uploadDocument = useCallback(
    async (file: File): Promise<DocumentMetadata | null> => {
      if (!isAuthenticated || !userId) {
        setError('You must be logged in to upload documents.');
        return null;
      }

      setError(null);
      setUploadStatus(UploadStatus.VALIDATING);

      try {
        setUploadStatus(UploadStatus.EXTRACTING);

        const result = await DocumentProcessor.process(file, userId);

        if (result) {
          setUploadStatus(UploadStatus.COMPLETE);
          refreshDocuments();
          return result;
        } else {
          setUploadStatus(UploadStatus.ERROR);
          setError(STATUS_MESSAGES.UPLOAD_ERROR);
          return null;
        }
      } catch (err) {
        setUploadStatus(UploadStatus.ERROR);
        const message = err instanceof Error ? err.message : STATUS_MESSAGES.UPLOAD_ERROR;
        setError(message);
        return null;
      }
    },
    [isAuthenticated, userId, refreshDocuments],
  );

  const deleteDocument = useCallback(
    (documentId: string): boolean => {
      if (!isAuthenticated || !userId) {
        setError('You must be logged in to delete documents.');
        return false;
      }

      try {
        const success = deleteDoc(documentId, userId);
        if (success) {
          refreshDocuments();
          setError(null);
          return true;
        } else {
          setError(STATUS_MESSAGES.DELETE_ERROR);
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : STATUS_MESSAGES.DELETE_ERROR;
        setError(message);
        return false;
      }
    },
    [isAuthenticated, userId, refreshDocuments],
  );

  const retryExtraction = useCallback(
    async (documentId: string): Promise<DocumentMetadata | null> => {
      if (!isAuthenticated || !userId) {
        setError('You must be logged in to retry extraction.');
        return null;
      }

      const doc = documents.find((d) => d.id === documentId);
      if (!doc) {
        setError('Document not found.');
        return null;
      }

      setError(null);
      setUploadStatus(UploadStatus.EXTRACTING);
      setLoading(true);

      try {
        const blob = new Blob([], { type: doc.fileType });
        const file = new File([blob], doc.fileName, { type: doc.fileType });

        const extractionResult = await retryExtractionStrategy(file);

        if (extractionResult.success) {
          const cleaned = cleanText(extractionResult.text);
          const updated = updateDocument(documentId, userId, {
            extractedText: cleaned,
            status: UploadStatus.COMPLETE,
          });

          setUploadStatus(UploadStatus.COMPLETE);
          setLoading(false);
          refreshDocuments();
          return updated;
        } else {
          const updated = updateDocument(documentId, userId, {
            status: UploadStatus.ERROR,
          });

          setUploadStatus(UploadStatus.ERROR);
          setError(extractionResult.error ?? STATUS_MESSAGES.EXTRACTION_FAILED);
          setLoading(false);
          refreshDocuments();
          return updated;
        }
      } catch (err) {
        setUploadStatus(UploadStatus.ERROR);
        const message = err instanceof Error ? err.message : STATUS_MESSAGES.EXTRACTION_FAILED;
        setError(message);
        setLoading(false);

        updateDocument(documentId, userId, {
          status: UploadStatus.ERROR,
        });
        refreshDocuments();
        return null;
      }
    },
    [isAuthenticated, userId, documents, refreshDocuments],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    documents,
    loading,
    error,
    uploadStatus,
    documentCount,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    retryExtraction,
    clearError,
  };
}

export default useDocuments;