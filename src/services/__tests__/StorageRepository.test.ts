import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  clearAllDocuments,
  updateDocument,
  getDocumentCount,
} from '../StorageRepository';
import { DocumentMetadata, UploadStatus } from '../../types';
import { STORAGE_KEYS } from '../../constants';

function createMockDocument(overrides: Partial<DocumentMetadata> = {}): DocumentMetadata {
  return {
    id: 'doc-1',
    fileName: 'test.pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    uploadTimestamp: Date.now(),
    extractedText: 'Sample extracted text',
    userId: 'user-1',
    status: UploadStatus.COMPLETE,
    ...overrides,
  };
}

describe('StorageRepository', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('saveDocument', () => {
    it('saves a document to localStorage for the given user', () => {
      const doc = createMockDocument();
      saveDocument(doc, 'user-1');

      const documents = getDocuments('user-1');
      expect(documents).toHaveLength(1);
      expect(documents[0].id).toBe('doc-1');
      expect(documents[0].fileName).toBe('test.pdf');
    });

    it('saves multiple documents for the same user', () => {
      const doc1 = createMockDocument({ id: 'doc-1', fileName: 'file1.pdf' });
      const doc2 = createMockDocument({ id: 'doc-2', fileName: 'file2.docx' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-1');

      const documents = getDocuments('user-1');
      expect(documents).toHaveLength(2);
    });

    it('keeps documents separate between users', () => {
      const doc1 = createMockDocument({ id: 'doc-1', userId: 'user-1' });
      const doc2 = createMockDocument({ id: 'doc-2', userId: 'user-2' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-2');

      expect(getDocuments('user-1')).toHaveLength(1);
      expect(getDocuments('user-2')).toHaveLength(1);
      expect(getDocuments('user-1')[0].id).toBe('doc-1');
      expect(getDocuments('user-2')[0].id).toBe('doc-2');
    });

    it('handles localStorage quota exceeded error', () => {
      const setItemSpy = localStorage.setItem as ReturnType<typeof vi.fn>;
      setItemSpy.mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      const doc = createMockDocument();
      expect(() => saveDocument(doc, 'user-1')).toThrow();
    });
  });

  describe('getDocuments', () => {
    it('returns an empty array when no documents exist for a user', () => {
      const documents = getDocuments('user-1');
      expect(documents).toEqual([]);
    });

    it('returns all documents for a given user', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-1');

      const documents = getDocuments('user-1');
      expect(documents).toHaveLength(2);
    });

    it('returns an empty array for a user with no documents when other users have documents', () => {
      const doc = createMockDocument({ id: 'doc-1', userId: 'user-1' });
      saveDocument(doc, 'user-1');

      const documents = getDocuments('user-2');
      expect(documents).toEqual([]);
    });
  });

  describe('getDocumentById', () => {
    it('returns the correct document by id', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      saveDocument(doc, 'user-1');

      const result = getDocumentById('doc-1', 'user-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('doc-1');
      expect(result!.fileName).toBe('test.pdf');
    });

    it('returns null when document id does not exist', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      saveDocument(doc, 'user-1');

      const result = getDocumentById('nonexistent', 'user-1');
      expect(result).toBeNull();
    });

    it('returns null when searching in wrong user scope', () => {
      const doc = createMockDocument({ id: 'doc-1', userId: 'user-1' });
      saveDocument(doc, 'user-1');

      const result = getDocumentById('doc-1', 'user-2');
      expect(result).toBeNull();
    });
  });

  describe('deleteDocument', () => {
    it('deletes a document by id and returns true', () => {
      const doc = createMockDocument({ id: 'doc-1' });
      saveDocument(doc, 'user-1');

      const result = deleteDocument('doc-1', 'user-1');
      expect(result).toBe(true);
      expect(getDocuments('user-1')).toHaveLength(0);
    });

    it('returns false when trying to delete a nonexistent document', () => {
      const result = deleteDocument('nonexistent', 'user-1');
      expect(result).toBe(false);
    });

    it('only deletes the specified document and keeps others', () => {
      const doc1 = createMockDocument({ id: 'doc-1', fileName: 'file1.pdf' });
      const doc2 = createMockDocument({ id: 'doc-2', fileName: 'file2.pdf' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-1');

      deleteDocument('doc-1', 'user-1');

      const remaining = getDocuments('user-1');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('doc-2');
    });

    it('does not affect other users documents', () => {
      const doc1 = createMockDocument({ id: 'doc-1', userId: 'user-1' });
      const doc2 = createMockDocument({ id: 'doc-2', userId: 'user-2' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-2');

      deleteDocument('doc-1', 'user-1');

      expect(getDocuments('user-1')).toHaveLength(0);
      expect(getDocuments('user-2')).toHaveLength(1);
    });
  });

  describe('clearAllDocuments', () => {
    it('removes all documents for a given user', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-1');

      clearAllDocuments('user-1');

      expect(getDocuments('user-1')).toEqual([]);
    });

    it('does not affect other users documents when clearing', () => {
      const doc1 = createMockDocument({ id: 'doc-1', userId: 'user-1' });
      const doc2 = createMockDocument({ id: 'doc-2', userId: 'user-2' });

      saveDocument(doc1, 'user-1');
      saveDocument(doc2, 'user-2');

      clearAllDocuments('user-1');

      expect(getDocuments('user-1')).toEqual([]);
      expect(getDocuments('user-2')).toHaveLength(1);
    });

    it('handles clearing when no documents exist', () => {
      expect(() => clearAllDocuments('user-1')).not.toThrow();
      expect(getDocuments('user-1')).toEqual([]);
    });
  });

  describe('updateDocument', () => {
    it('updates a document and returns the updated document', () => {
      const doc = createMockDocument({ id: 'doc-1', fileName: 'original.pdf' });
      saveDocument(doc, 'user-1');

      const updated = updateDocument('doc-1', 'user-1', { fileName: 'renamed.pdf' });
      expect(updated).not.toBeNull();
      expect(updated!.fileName).toBe('renamed.pdf');
      expect(updated!.id).toBe('doc-1');
    });

    it('returns null when updating a nonexistent document', () => {
      const result = updateDocument('nonexistent', 'user-1', { fileName: 'test.pdf' });
      expect(result).toBeNull();
    });

    it('persists the update in storage', () => {
      const doc = createMockDocument({ id: 'doc-1', extractedText: 'old text' });
      saveDocument(doc, 'user-1');

      updateDocument('doc-1', 'user-1', { extractedText: 'new text' });

      const retrieved = getDocumentById('doc-1', 'user-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved!.extractedText).toBe('new text');
    });
  });

  describe('getDocumentCount', () => {
    it('returns 0 when no documents exist', () => {
      expect(getDocumentCount('user-1')).toBe(0);
    });

    it('returns the correct count of documents', () => {
      saveDocument(createMockDocument({ id: 'doc-1' }), 'user-1');
      saveDocument(createMockDocument({ id: 'doc-2' }), 'user-1');
      saveDocument(createMockDocument({ id: 'doc-3' }), 'user-1');

      expect(getDocumentCount('user-1')).toBe(3);
    });

    it('returns correct count after deletion', () => {
      saveDocument(createMockDocument({ id: 'doc-1' }), 'user-1');
      saveDocument(createMockDocument({ id: 'doc-2' }), 'user-1');

      deleteDocument('doc-1', 'user-1');

      expect(getDocumentCount('user-1')).toBe(1);
    });
  });
});