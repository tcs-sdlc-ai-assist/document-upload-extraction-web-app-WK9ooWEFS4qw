import { describe, it, expect } from 'vitest';
import { cleanText } from '../TextCleaner';

describe('TextCleaner', () => {
  describe('cleanText', () => {
    it('should return an empty string when given an empty string', () => {
      expect(cleanText('')).toBe('');
    });

    it('should return an empty string when given only whitespace', () => {
      const result = cleanText('   \t\t  \n\n  ');
      expect(result.trim()).toBe('');
    });

    it('should preserve valid text content', () => {
      const input = 'Hello, world! This is a test.';
      const result = cleanText(input);
      expect(result).toContain('Hello, world!');
      expect(result).toContain('This is a test.');
    });

    it('should normalize multiple spaces to a single space', () => {
      const input = 'Hello    world     test';
      const result = cleanText(input);
      expect(result).not.toMatch(/  /);
      expect(result).toContain('Hello world test');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x00World\x01Test\x02Data\x03End';
      const result = cleanText(input);
      expect(result).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).toContain('Test');
      expect(result).toContain('Data');
      expect(result).toContain('End');
    });

    it('should normalize different line endings to consistent format', () => {
      const input = 'Line1\r\nLine2\rLine3\nLine4';
      const result = cleanText(input);
      expect(result).not.toContain('\r\n');
      expect(result).not.toMatch(/\r(?!\n)/);
      expect(result).toContain('Line1');
      expect(result).toContain('Line2');
      expect(result).toContain('Line3');
      expect(result).toContain('Line4');
    });

    it('should handle text with excessive blank lines', () => {
      const input = 'Paragraph 1\n\n\n\n\n\nParagraph 2';
      const result = cleanText(input);
      const consecutiveNewlines = result.match(/\n{3,}/g);
      expect(consecutiveNewlines).toBeNull();
      expect(result).toContain('Paragraph 1');
      expect(result).toContain('Paragraph 2');
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '   Hello World   ';
      const result = cleanText(input);
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
      expect(result).toContain('Hello World');
    });

    it('should preserve special characters like punctuation and symbols', () => {
      const input = 'Price: $100.00 — 50% off! (Limited time only.)';
      const result = cleanText(input);
      expect(result).toContain('$100.00');
      expect(result).toContain('50%');
      expect(result).toContain('(Limited time only.)');
    });

    it('should preserve unicode characters', () => {
      const input = 'Café résumé naïve über straße';
      const result = cleanText(input);
      expect(result).toContain('Café');
      expect(result).toContain('résumé');
      expect(result).toContain('naïve');
      expect(result).toContain('über');
      expect(result).toContain('straße');
    });

    it('should handle a mix of control characters and valid content', () => {
      const input = '\x00Hello\x01,\x02 \x03world\x04!\x05';
      const result = cleanText(input);
      expect(result).toContain('Hello');
      expect(result).toContain('world');
      expect(result).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
    });

    it('should handle tabs by normalizing them', () => {
      const input = 'Column1\t\t\tColumn2\t\tColumn3';
      const result = cleanText(input);
      expect(result).toContain('Column1');
      expect(result).toContain('Column2');
      expect(result).toContain('Column3');
    });

    it('should handle very long text without errors', () => {
      const input = 'A'.repeat(100000);
      const result = cleanText(input);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(100000);
    });

    it('should handle text with only control characters', () => {
      const input = '\x00\x01\x02\x03\x04\x05';
      const result = cleanText(input);
      expect(result.trim()).toBe('');
    });

    it('should preserve newlines between paragraphs', () => {
      const input = 'First paragraph.\n\nSecond paragraph.';
      const result = cleanText(input);
      expect(result).toContain('First paragraph.');
      expect(result).toContain('Second paragraph.');
    });

    it('should handle mixed whitespace characters', () => {
      const input = 'Hello \t \t world';
      const result = cleanText(input);
      expect(result).not.toMatch(/\t/);
      expect(result).toContain('Hello');
      expect(result).toContain('world');
    });
  });
});