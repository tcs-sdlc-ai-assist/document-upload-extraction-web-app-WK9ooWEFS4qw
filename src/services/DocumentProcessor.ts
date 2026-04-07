import { validateFile } from './FileValidator';
import { extractText, retryExtraction as retryExtract } from './ExtractorStrategy';
import { cleanText } from './TextCleaner';
import {
  saveDocument,
  getDocuments,
  deleteDocument as removeDocument,
  getDocumentById,
} from './StorageRepository';
import { UploadStatus } from '../types';
import type { DocumentMetadata } from '../types';

function generateDocumentId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export type ProgressCallback = (status: UploadStatus, message?: string) => void;

export interface UploadResult {
  success: boolean;
  documentId?: string;
  error?: string;
  metadata?: DocumentMetadata;
  extractedText?: string;
}

export async function uploadDocument(
  file: File,
  userId: string,
  onProgress?: ProgressCallback,
): Promise<UploadResult> {
  const documentId = generateDocumentId();
  const timestamp = Date.now();

  try {
    // Step 1: Validate
    if (onProgress) {
      onProgress(UploadStatus.VALIDATING, 'Validating file...');
    }

    const validation = validateFile(file);

    if (!validation.valid) {
      const errorDoc: DocumentMetadata = {
        id: documentId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadTimestamp: timestamp,
        extractedText: '',
        userId,
        status: UploadStatus.ERROR,
      };

      saveDocument(errorDoc, userId);

      if (onProgress) {
        onProgress(UploadStatus.ERROR, validation.error ?? 'Validation failed.');
      }

      return {
        success: false,
        documentId,
        error: validation.error ?? 'Validation failed.',
        metadata: errorDoc,
      };
    }

    // Step 2: Create initial document record
    if (onProgress) {
      onProgress(UploadStatus.UPLOADING, 'Preparing document...');
    }

    const initialDoc: DocumentMetadata = {
      id: documentId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadTimestamp: timestamp,
      extractedText: '',
      userId,
      status: UploadStatus.EXTRACTING,
    };

    saveDocument(initialDoc, userId);

    // Step 3: Extract text
    if (onProgress) {
      onProgress(UploadStatus.EXTRACTING, 'Extracting text from document...');
    }

    const extractionResult = await extractText(file);

    if (!extractionResult.success) {
      const errorDoc: DocumentMetadata = {
        ...initialDoc,
        status: UploadStatus.ERROR,
      };

      saveDocument(errorDoc, userId);

      if (onProgress) {
        onProgress(UploadStatus.ERROR, extractionResult.error ?? 'Extraction failed.');
      }

      return {
        success: false,
        documentId,
        error: extractionResult.error ?? 'Extraction failed.',
        metadata: errorDoc,
      };
    }

    // Step 4: Clean text
    if (onProgress) {
      onProgress(UploadStatus.CLEANING, 'Cleaning extracted text...');
    }

    const cleanedText = cleanText(extractionResult.text);

    // Step 5: Store final result
    const completeDoc: DocumentMetadata = {
      ...initialDoc,
      extractedText: cleanedText,
      status: UploadStatus.COMPLETE,
    };

    saveDocument(completeDoc, userId);

    if (onProgress) {
      onProgress(UploadStatus.COMPLETE, 'Document uploaded and text extracted successfully.');
    }

    return {
      success: true,
      documentId,
      metadata: completeDoc,
      extractedText: cleanedText,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during document processing.';

    const errorDoc: DocumentMetadata = {
      id: documentId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadTimestamp: timestamp,
      extractedText: '',
      userId,
      status: UploadStatus.ERROR,
    };

    try {
      saveDocument(errorDoc, userId);
    } catch {
      // Storage failure during error handling — nothing more we can do
    }

    if (onProgress) {
      onProgress(UploadStatus.ERROR, message);
    }

    return {
      success: false,
      documentId,
      error: message,
      metadata: errorDoc,
    };
  }
}

export function getStoredDocuments(userId: string): DocumentMetadata[] {
  return getDocuments(userId);
}

export function deleteStoredDocument(docId: string, userId: string): boolean {
  return removeDocument(docId, userId);
}

export async function retryExtraction(
  docId: string,
  file: File,
  userId: string,
  onProgress?: ProgressCallback,
): Promise<UploadResult> {
  const existingDoc = getDocumentById(docId, userId);

  if (!existingDoc) {
    return {
      success: false,
      documentId: docId,
      error: 'Document not found.',
    };
  }

  try {
    // Update status to extracting
    if (onProgress) {
      onProgress(UploadStatus.EXTRACTING, 'Retrying text extraction...');
    }

    const updatedDoc: DocumentMetadata = {
      ...existingDoc,
      status: UploadStatus.EXTRACTING,
    };

    saveDocument(updatedDoc, userId);

    // Retry extraction with built-in retry logic
    const extractionResult = await retryExtract(file);

    if (!extractionResult.success) {
      const errorDoc: DocumentMetadata = {
        ...updatedDoc,
        status: UploadStatus.ERROR,
      };

      saveDocument(errorDoc, userId);

      if (onProgress) {
        onProgress(UploadStatus.ERROR, extractionResult.error ?? 'Extraction retry failed.');
      }

      return {
        success: false,
        documentId: docId,
        error: extractionResult.error ?? 'Extraction retry failed.',
        metadata: errorDoc,
      };
    }

    // Clean text
    if (onProgress) {
      onProgress(UploadStatus.CLEANING, 'Cleaning extracted text...');
    }

    const cleanedText = cleanText(extractionResult.text);

    // Store final result
    const completeDoc: DocumentMetadata = {
      ...updatedDoc,
      extractedText: cleanedText,
      status: UploadStatus.COMPLETE,
    };

    saveDocument(completeDoc, userId);

    if (onProgress) {
      onProgress(UploadStatus.COMPLETE, 'Text extraction retry successful.');
    }

    return {
      success: true,
      documentId: docId,
      metadata: completeDoc,
      extractedText: cleanedText,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during extraction retry.';

    const errorDoc: DocumentMetadata = {
      ...existingDoc,
      status: UploadStatus.ERROR,
    };

    try {
      saveDocument(errorDoc, userId);
    } catch {
      // Storage failure during error handling
    }

    if (onProgress) {
      onProgress(UploadStatus.ERROR, message);
    }

    return {
      success: false,
      documentId: docId,
      error: message,
      metadata: errorDoc,
    };
  }
}

export const DocumentProcessor = {
  uploadDocument,
  getStoredDocuments,
  deleteStoredDocument,
  retryExtraction,
} as const;

export default DocumentProcessor;