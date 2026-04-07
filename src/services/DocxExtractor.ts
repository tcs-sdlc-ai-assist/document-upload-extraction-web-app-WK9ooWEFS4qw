import mammoth from 'mammoth';
import type { ExtractionResult } from '../types';

export async function extractDocx(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value && result.messages.length > 0) {
      const warningMessages = result.messages
        .map((msg) => msg.message)
        .join('; ');
      return {
        success: true,
        text: '',
        error: `DOCX extraction completed with warnings: ${warningMessages}`,
      };
    }

    return {
      success: true,
      text: result.value || '',
      error: null,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during DOCX extraction';
    return {
      success: false,
      text: '',
      error: `Failed to extract text from DOCX file "${file.name}": ${message}`,
    };
  }
}