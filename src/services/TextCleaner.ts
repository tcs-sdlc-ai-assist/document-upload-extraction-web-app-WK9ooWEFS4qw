export function cleanText(rawText: string): string {
  if (!rawText) {
    return '';
  }

  let cleaned = rawText;

  // Remove non-printable and control characters (keep newlines, tabs, and standard whitespace)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize line endings to \n
  cleaned = cleaned.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\r/g, '\n');

  // Replace tabs with spaces
  cleaned = cleaned.replace(/\t/g, ' ');

  // Normalize multiple spaces to a single space (within lines)
  cleaned = cleaned
    .split('\n')
    .map((line) => line.replace(/ {2,}/g, ' ').trim())
    .join('\n');

  // Remove excessive blank lines (more than 2 consecutive newlines become 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove non-printable Unicode characters (zero-width spaces, BOM, etc.)
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200C\u200D\u00AD]/g, '');

  // Remove other Unicode control characters (C0/C1 range not already handled)
  cleaned = cleaned.replace(/[\u0080-\u009F]/g, '');

  // Trim the entire result
  cleaned = cleaned.trim();

  return cleaned;
}