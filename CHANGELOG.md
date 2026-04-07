# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-15

### Added

- **Frontend Authentication**
  - User signup and login with client-side validation
  - Password hashing using the Web Crypto API
  - Session persistence via localStorage
  - Protected route guards for authenticated-only pages
  - Logout functionality with session cleanup

- **Document Upload**
  - Drag-and-drop file upload with `react-dropzone` integration
  - Click-to-browse file selection as an alternative to drag-and-drop
  - File type validation supporting PDF, DOCX, and TXT formats
  - File size validation with configurable maximum (default 10MB)
  - Real-time upload progress indicators with accessible status updates

- **Text Extraction**
  - PDF text extraction using `pdfjs-dist`
  - DOCX text extraction using `mammoth.js`
  - TXT text extraction using native `FileReader` API
  - Strategy pattern for automatic extractor routing based on file type
  - Retry mechanism for failed extractions

- **Text Cleaning**
  - Post-extraction text cleaning and normalization
  - Removal of excessive whitespace and control characters
  - Consistent line break handling

- **Document Management**
  - localStorage-based CRUD operations for document metadata and extracted text
  - Document history page with search and filtering
  - Document deletion with confirmation
  - Dashboard overview with document statistics
  - Document cards displaying file metadata, status, and extracted text preview

- **Responsive Accessible UI**
  - Fully responsive layout with Tailwind CSS (mobile, tablet, desktop)
  - Accessible header with keyboard navigation and ARIA attributes
  - Accessible sidebar navigation with focus management
  - Skip-to-content link for keyboard users
  - ARIA live regions for dynamic status messages
  - Semantic HTML landmarks (`main`, `nav`, `banner`)
  - Focus-visible outlines and screen reader support
  - Reduced motion support via `prefers-reduced-motion` media query

- **Error Handling**
  - Comprehensive error handling across all async operations
  - User-friendly error messages via status bar notifications
  - Auto-dismissing status messages with configurable timeout
  - Form validation with inline error feedback

- **Developer Experience**
  - TypeScript strict mode for type safety
  - Vite for fast development and optimized production builds
  - Vitest with Testing Library for unit testing
  - Environment variable configuration via `.env` files
  - Vercel deployment configuration with SPA rewrites

[1.0.0]: https://github.com/doc-upload-extract/doc-upload-extract/releases/tag/v1.0.0