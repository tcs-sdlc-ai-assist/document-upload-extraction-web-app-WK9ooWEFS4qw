export const APP_NAME = import.meta.env.VITE_APP_NAME || 'DocUploadExtract';

export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'doc_upload_';

export const SUPPORTED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

export type SupportedFileExtension = (typeof SUPPORTED_FILE_EXTENSIONS)[number];

export const SUPPORTED_MIME_TYPES: Record<SupportedFileExtension, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
} as const;

export const SUPPORTED_MIME_TYPE_LIST: string[] = Object.values(SUPPORTED_MIME_TYPES);

export const ACCEPT_FILE_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

export const STORAGE_KEYS = {
  USERS: `${STORAGE_PREFIX}users`,
  SESSION: `${STORAGE_PREFIX}session`,
  DOCUMENTS: `${STORAGE_PREFIX}documents`,
} as const;

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  HISTORY: '/history',
} as const;

export const STATUS_MESSAGES = {
  UPLOAD_SUCCESS: 'Document uploaded and text extracted successfully.',
  UPLOAD_ERROR: 'An error occurred while processing the document.',
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`,
  UNSUPPORTED_FILE_TYPE: `Unsupported file type. Please upload one of: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`,
  EXTRACTION_IN_PROGRESS: 'Extracting text from document...',
  EXTRACTION_COMPLETE: 'Text extraction complete.',
  EXTRACTION_FAILED: 'Failed to extract text from the document.',
  DELETE_SUCCESS: 'Document deleted successfully.',
  DELETE_ERROR: 'An error occurred while deleting the document.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGIN_ERROR: 'Invalid email or password.',
  SIGNUP_SUCCESS: 'Account created successfully.',
  SIGNUP_ERROR: 'An error occurred during signup.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  VALIDATION_EMAIL_REQUIRED: 'Email is required.',
  VALIDATION_EMAIL_INVALID: 'Please enter a valid email address.',
  VALIDATION_PASSWORD_REQUIRED: 'Password is required.',
  VALIDATION_PASSWORD_WEAK: 'Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.',
  VALIDATION_NAME_REQUIRED: 'Name is required.',
  NO_DOCUMENTS: 'No documents found. Upload your first document to get started.',
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
} as const;