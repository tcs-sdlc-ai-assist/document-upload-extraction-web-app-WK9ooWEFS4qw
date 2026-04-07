# DocUploadExtract

A client-side document upload and text extraction application built with React, TypeScript, and Vite. Upload PDF, DOCX, and TXT files to extract and store text content entirely in the browser — no server required.

## Features

- **Document Upload** — Drag-and-drop or click-to-upload interface supporting PDF, DOCX, and TXT files
- **Text Extraction** — Client-side text extraction using pdfjs-dist (PDF), mammoth.js (DOCX), and native FileReader (TXT)
- **Text Cleaning** — Automatic post-extraction text cleaning and normalization
- **Document History** — Browse, search, and manage previously uploaded documents
- **Dashboard** — Overview of document statistics and recent uploads
- **Authentication** — Frontend-only authentication with localStorage persistence
- **Accessibility** — WCAG-compliant components with ARIA labels, keyboard navigation, skip links, and screen reader support
- **Responsive Design** — Mobile-first layout with Tailwind CSS utility classes
- **Offline Capable** — All processing and storage happens in the browser using localStorage

## Tech Stack

- **Framework:** [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 5](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Routing:** [React Router 6](https://reactrouter.com/)
- **PDF Extraction:** [pdfjs-dist](https://github.com/nicknisi/pdfjs-dist)
- **DOCX Extraction:** [mammoth.js](https://github.com/mwilliamson/mammoth.js)
- **File Upload:** [react-dropzone](https://react-dropzone.js.org/)
- **Testing:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

## Folder Structure

```
doc-upload-extract/
├── index.html                          # SPA HTML entry point
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite build configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS plugin configuration
├── vitest.setup.ts                     # Test setup and configuration
├── vercel.json                         # Vercel deployment configuration
├── .env.example                        # Environment variable template
├── src/
│   ├── main.tsx                        # Application entry point
│   ├── App.tsx                         # Root component with routing
│   ├── types.ts                        # Shared TypeScript type definitions
│   ├── constants.ts                    # Application constants and configuration
│   ├── index.css                       # Global Tailwind CSS styles
│   ├── vite-env.d.ts                   # Vite environment type declarations
│   ├── components/
│   │   ├── AccessibleHeader.tsx        # Application header with navigation
│   │   ├── AccessibleSidebar.tsx       # Sidebar navigation component
│   │   ├── AppLayout.tsx               # Main layout shell
│   │   ├── DocumentCard.tsx            # Document display card
│   │   ├── FileDropzone.tsx            # Drag-and-drop file upload
│   │   ├── MainContentArea.tsx         # Main content wrapper
│   │   ├── ProtectedRoute.tsx          # Route guard for authentication
│   │   ├── StatusBar.tsx               # Status message notifications
│   │   └── UploadProgress.tsx          # Upload progress indicator
│   ├── context/
│   │   └── AuthContext.tsx             # Authentication state management
│   ├── hooks/
│   │   └── useDocuments.ts            # Document operations hook
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Dashboard overview
│   │   ├── HistoryPage.tsx             # Document history
│   │   ├── LoginPage.tsx               # Login page
│   │   ├── SignupPage.tsx              # Signup page
│   │   └── UploadPage.tsx              # Document upload page
│   └── services/
│       ├── AuthService.ts              # Authentication service
│       ├── DocumentProcessor.ts        # Document processing orchestrator
│       ├── DocxExtractor.ts            # DOCX text extraction
│       ├── ExtractorStrategy.ts        # Extraction routing strategy
│       ├── FileValidator.ts            # File validation service
│       ├── PdfExtractor.ts             # PDF text extraction
│       ├── StorageRepository.ts        # localStorage CRUD service
│       ├── TextCleaner.ts              # Text cleaning utility
│       ├── TxtExtractor.ts            # TXT text extraction
│       └── __tests__/
│           ├── AuthService.test.ts     # Auth service tests
│           ├── FileValidator.test.ts   # File validator tests
│           ├── StorageRepository.test.ts # Storage repository tests
│           └── TextCleaner.test.ts     # Text cleaner tests
├── CHANGELOG.md                        # Version history
├── DEPLOYMENT.md                       # Deployment guide
└── README.md                           # This file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd doc-upload-extract

# Install dependencies
npm install
```

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_NAME` | `DocUploadExtract` | Application display name |
| `VITE_MAX_FILE_SIZE_MB` | `10` | Maximum file upload size in megabytes |
| `VITE_STORAGE_PREFIX` | `doc_upload_` | Prefix for localStorage keys |

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Build

Create a production build:

```bash
npm run build
```

This runs TypeScript type checking (`tsc --noEmit`) followed by the Vite production build. Output is written to the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

Tests use [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) for DOM simulation and [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for component testing.

## Supported File Types

| Format | Extension | MIME Type | Extraction Library |
|---|---|---|---|
| PDF | `.pdf` | `application/pdf` | pdfjs-dist |
| DOCX | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | mammoth.js |
| Plain Text | `.txt` | `text/plain` | Native FileReader |

The maximum file size is configurable via the `VITE_MAX_FILE_SIZE_MB` environment variable (default: 10 MB).

## Architecture

The application follows a layered architecture with clear separation of concerns:

- **Services Layer** — Stateless modules for validation (`FileValidator`), extraction (`PdfExtractor`, `DocxExtractor`, `TxtExtractor`), text cleaning (`TextCleaner`), storage (`StorageRepository`), and authentication (`AuthService`)
- **Strategy Pattern** — `ExtractorStrategy` routes files to the appropriate extractor based on file type, with retry support
- **Orchestrator** — `DocumentProcessor` coordinates the full upload pipeline: validation → extraction → cleaning → storage
- **Hooks Layer** — `useDocuments` provides a React-friendly interface to document operations with state management
- **Context Layer** — `AuthContext` manages authentication state across the component tree
- **Component Layer** — Reusable, accessible UI components composed into page layouts

All data is stored in the browser's `localStorage`. There is no backend server — authentication, document processing, and storage are entirely client-side.

## Deployment

This application is configured for deployment on [Vercel](https://vercel.com/). The `vercel.json` file includes SPA rewrites to support client-side routing.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Accessibility

This application is built with accessibility as a core requirement:

- **Semantic HTML** — Proper use of landmarks (`<main>`, `<nav>`, `<header>`), headings hierarchy, and ARIA attributes
- **Keyboard Navigation** — All interactive elements are keyboard accessible with visible focus indicators
- **Skip Links** — Skip-to-content link for keyboard users to bypass navigation
- **Screen Reader Support** — ARIA labels, live regions for status updates, and descriptive text for all interactive elements
- **Focus Management** — Focus is managed programmatically during route changes and modal interactions
- **Color Contrast** — Color palette meets WCAG AA contrast requirements
- **Reduced Motion** — Respects `prefers-reduced-motion` media query to disable animations

## License

Private — All rights reserved.