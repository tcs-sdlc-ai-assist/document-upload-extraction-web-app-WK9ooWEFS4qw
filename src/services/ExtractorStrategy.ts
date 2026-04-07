import { ExtractionResult } from '../types';
import { extractPdf } from './PdfExtractor';
import { extractDocx } from './DocxExtractor';
import { txtExtractor } from './TxtExtractor';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

type ExtractorFn = (file: File) => Promise<ExtractionResult>;

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

function getExtractorForFile(file: File): ExtractorFn | null {
  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  if (extension === '.pdf' || mimeType === 'application/pdf') {
    return extractPdf;
  }

  if (
    extension === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractDocx;
  }

  if (extension === '.txt' || mimeType === 'text/plain') {
    return (f: File) => txtExtractor.extractTxt(f);
  }

  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractText(file: File): Promise<ExtractionResult> {
  const extractor = getExtractorForFile(file);

  if (!extractor) {
    return {
      success: false,
      text: '',
      error: `Unsupported file type for extraction: "${file.name}" (type: ${file.type || 'unknown'})`,
    };
  }

  try {
    const result = await extractor(file);
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown extraction error occurred.';
    return {
      success: false,
      text: '',
      error: `Extraction failed for "${file.name}": ${message}`,
    };
  }
}

export async function retryExtraction(file: File): Promise<ExtractionResult> {
  const extractor = getExtractorForFile(file);

  if (!extractor) {
    return {
      success: false,
      text: '',
      error: `Unsupported file type for extraction: "${file.name}" (type: ${file.type || 'unknown'})`,
    };
  }

  let lastResult: ExtractionResult = {
    success: false,
    text: '',
    error: 'Extraction not attempted.',
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await extractor(file);

      if (result.success) {
        return result;
      }

      lastResult = result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown extraction error occurred.';
      lastResult = {
        success: false,
        text: '',
        error: `Extraction attempt ${attempt + 1} failed for "${file.name}": ${message}`,
      };
    }

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  return {
    success: false,
    text: lastResult.text,
    error: `Extraction failed after ${MAX_RETRIES + 1} attempts for "${file.name}". Last error: ${lastResult.error}`,
  };
}

export const ExtractorStrategy = {
  extractText,
  retryExtraction,
} as const;

export default ExtractorStrategy;