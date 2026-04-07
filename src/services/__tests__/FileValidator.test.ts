import { describe, it, expect } from 'vitest';
import { validateFile } from '../FileValidator';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, STATUS_MESSAGES } from '../../constants';

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

describe('FileValidator', () => {
  describe('valid files', () => {
    it('accepts a valid PDF file', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });

    it('accepts a valid DOCX file', () => {
      const file = createMockFile(
        'document.docx',
        2048,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });

    it('accepts a valid TXT file', () => {
      const file = createMockFile('notes.txt', 512, 'text/plain');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });

    it('accepts a file exactly at the max size limit', () => {
      const file = createMockFile('large.pdf', MAX_FILE_SIZE_BYTES, 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });
  });

  describe('invalid file types', () => {
    it('rejects an unsupported file type (image/png)', () => {
      const file = createMockFile('photo.png', 1024, 'image/png');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE);
    });

    it('rejects a .exe file', () => {
      const file = createMockFile('program.exe', 1024, 'application/x-msdownload');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE);
    });

    it('rejects a .csv file', () => {
      const file = createMockFile('data.csv', 1024, 'text/csv');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(STATUS_MESSAGES.UNSUPPORTED_FILE_TYPE);
    });
  });

  describe('file size validation', () => {
    it('rejects a file exceeding the max size limit', () => {
      const file = createMockFile('huge.pdf', MAX_FILE_SIZE_BYTES + 1, 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(STATUS_MESSAGES.FILE_TOO_LARGE);
    });

    it('rejects a significantly oversized file', () => {
      const file = createMockFile('massive.docx', MAX_FILE_SIZE_BYTES * 2, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(STATUS_MESSAGES.FILE_TOO_LARGE);
    });
  });

  describe('edge cases', () => {
    it('accepts a zero-byte file with valid type', () => {
      const file = createMockFile('empty.txt', 0, 'text/plain');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });

    it('accepts a 1-byte file with valid type', () => {
      const file = createMockFile('tiny.pdf', 1, 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.file).toBe(file);
    });

    it('rejects a file with valid extension but wrong MIME type', () => {
      const file = createMockFile('fake.pdf', 1024, 'image/jpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).not.toBeNull();
    });

    it('confirms MAX_FILE_SIZE_MB is configured correctly', () => {
      expect(MAX_FILE_SIZE_MB).toBeGreaterThan(0);
      expect(MAX_FILE_SIZE_BYTES).toBe(MAX_FILE_SIZE_MB * 1024 * 1024);
    });
  });
});