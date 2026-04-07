import { DocumentMetadata } from '../types';
import { STORAGE_KEYS } from '../constants';

function getStorageKey(userId: string): string {
  return `${STORAGE_KEYS.DOCUMENTS}_${userId}`;
}

function readDocuments(userId: string): DocumentMetadata[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as DocumentMetadata[];
  } catch {
    return [];
  }
}

function writeDocuments(userId: string, documents: DocumentMetadata[]): void {
  try {
    const key = getStorageKey(userId);
    const serialized = JSON.stringify(documents);
    localStorage.setItem(key, serialized);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some documents to free up space.');
    }
    throw new Error('Failed to save documents to storage.');
  }
}

export function saveDocument(doc: DocumentMetadata, userId: string): void {
  const documents = readDocuments(userId);
  const existingIndex = documents.findIndex((d) => d.id === doc.id);
  if (existingIndex >= 0) {
    documents[existingIndex] = doc;
  } else {
    documents.push(doc);
  }
  writeDocuments(userId, documents);
}

export function getDocuments(userId: string): DocumentMetadata[] {
  return readDocuments(userId);
}

export function getDocumentById(docId: string, userId: string): DocumentMetadata | null {
  const documents = readDocuments(userId);
  return documents.find((d) => d.id === docId) ?? null;
}

export function deleteDocument(docId: string, userId: string): boolean {
  const documents = readDocuments(userId);
  const filtered = documents.filter((d) => d.id !== docId);
  if (filtered.length === documents.length) {
    return false;
  }
  writeDocuments(userId, filtered);
  return true;
}

export function clearAllDocuments(userId: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch {
    throw new Error('Failed to clear documents from storage.');
  }
}

export function updateDocument(
  docId: string,
  userId: string,
  updates: Partial<Omit<DocumentMetadata, 'id' | 'userId'>>
): DocumentMetadata | null {
  const documents = readDocuments(userId);
  const index = documents.findIndex((d) => d.id === docId);
  if (index < 0) {
    return null;
  }
  documents[index] = { ...documents[index], ...updates };
  writeDocuments(userId, documents);
  return documents[index];
}

export function getDocumentCount(userId: string): number {
  return readDocuments(userId).length;
}