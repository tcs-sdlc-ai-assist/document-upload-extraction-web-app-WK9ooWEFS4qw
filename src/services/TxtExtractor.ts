import { ExtractionResult } from '../types';

export class TxtExtractor {
  async extractTxt(file: File): Promise<ExtractionResult> {
    try {
      const text = await this.readFileAsText(file);

      return {
        success: true,
        text,
        error: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read text file.';
      return {
        success: false,
        text: '',
        error: message,
      };
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return a string result.'));
        }
      };

      reader.onerror = () => {
        const error = reader.error;
        reject(new Error(error?.message || 'An error occurred while reading the text file.'));
      };

      reader.onabort = () => {
        reject(new Error('File reading was aborted.'));
      };

      try {
        reader.readAsText(file, 'UTF-8');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initiate file reading.';
        reject(new Error(message));
      }
    });
  }
}

export const txtExtractor = new TxtExtractor();