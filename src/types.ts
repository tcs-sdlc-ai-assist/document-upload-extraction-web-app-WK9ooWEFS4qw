export enum UploadStatus {
  IDLE = 'idle',
  VALIDATING = 'validating',
  UPLOADING = 'uploading',
  EXTRACTING = 'extracting',
  CLEANING = 'cleaning',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionToken: string | null;
}

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTimestamp: number;
  extractedText: string;
  userId: string;
  status: UploadStatus;
}

export interface FileValidationResult {
  valid: boolean;
  error: string | null;
  file: File | null;
}

export interface ExtractionResult {
  success: boolean;
  text: string;
  error: string | null;
}

export interface StorageEntry<T> {
  key: string;
  value: T;
  timestamp: number;
}

export type StatusMessageType = 'info' | 'success' | 'error' | 'warning';

export interface StatusMessage {
  id: string;
  text: string;
  type: StatusMessageType;
  timestamp: number;
}