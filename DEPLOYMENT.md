# Deployment Guide

This guide covers deploying **Doc Upload Extract** to [Vercel](https://vercel.com), including environment configuration, build settings, SPA routing, and troubleshooting.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
  - [Option 1: Deploy via Vercel Dashboard](#option-1-deploy-via-vercel-dashboard)
  - [Option 2: Deploy via Vercel CLI](#option-2-deploy-via-vercel-cli)
- [Environment Variables](#environment-variables)
- [Build Settings](#build-settings)
- [SPA Routing Configuration](#spa-routing-configuration)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js 18+ installed locally (for CLI deployments)
4. All tests passing locally:

```bash
npm run test
```

5. A successful local build:

```bash
npm run build
```

---

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Log in** to [vercel.com](https://vercel.com) and click **"Add New Project"**.

2. **Import your repository** by selecting the Git provider where your project is hosted and choosing the `doc-upload-extract` repository.

3. **Configure the project**:
   - **Framework Preset**: Select `Vite`
   - **Root Directory**: Leave as `.` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add environment variables** (see [Environment Variables](#environment-variables) section below).

5. Click **"Deploy"** and wait for the build to complete.

6. Once deployed, Vercel will provide a production URL (e.g., `https://your-project.vercel.app`).

### Option 2: Deploy via Vercel CLI

1. **Install the Vercel CLI** globally:

```bash
npm install -g vercel
```

2. **Log in** to your Vercel account:

```bash
vercel login
```

3. **Navigate** to your project directory:

```bash
cd doc-upload-extract
```

4. **Deploy to preview** (staging):

```bash
vercel
```

5. **Deploy to production**:

```bash
vercel --prod
```

The CLI will prompt you to configure the project on first deployment. Accept the default settings or customize as needed.

---

## Environment Variables

Configure the following environment variables in your Vercel project settings under **Settings → Environment Variables**:

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_APP_NAME` | No | `DocUploadExtract` | Application display name shown in the header and login pages |
| `VITE_MAX_FILE_SIZE_MB` | No | `10` | Maximum allowed file upload size in megabytes |
| `VITE_STORAGE_PREFIX` | No | `doc_upload_` | Prefix for all localStorage keys to avoid collisions |

### Setting Environment Variables

**Via Vercel Dashboard:**

1. Go to your project on Vercel.
2. Navigate to **Settings → Environment Variables**.
3. Add each variable with its value.
4. Select the environments where the variable should be available: **Production**, **Preview**, and/or **Development**.
5. Click **Save**.

**Via Vercel CLI:**

```bash
vercel env add VITE_APP_NAME
# Follow the prompts to set the value and target environments
```

### Important Notes

- All environment variables used in the frontend **must** be prefixed with `VITE_` to be exposed to the client-side bundle by Vite.
- Environment variables are embedded at **build time**, not runtime. After changing a variable, you must **redeploy** for the change to take effect.
- Do **not** store sensitive secrets (API keys, database credentials) in `VITE_`-prefixed variables, as they are included in the client-side JavaScript bundle. This application uses localStorage for all data persistence, so no server-side secrets are required.
- Reference the `.env.example` file in the project root for the complete list of available variables.

---

## Build Settings

The following build configuration is used for Vercel deployments:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or 20.x |

### Build Process

The build command (`npm run build`) executes two steps:

1. **TypeScript type checking**: `tsc --noEmit` — validates all TypeScript types without emitting files.
2. **Vite production build**: `vite build` — bundles the application with tree-shaking, minification, and code splitting.

The output is placed in the `dist/` directory, which Vercel serves as static files.

### Node.js Version

To pin a specific Node.js version on Vercel, you can:

- Add an `engines` field to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- Or set the Node.js version in **Vercel Dashboard → Settings → General → Node.js Version**.

---

## SPA Routing Configuration

This application uses React Router for client-side routing. The `vercel.json` file at the project root configures Vercel to handle SPA routing correctly:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### How It Works

- All incoming requests that don't match a static file in `dist/` are rewritten to `/index.html`.
- React Router then handles the URL on the client side and renders the appropriate page component.
- This prevents 404 errors when users navigate directly to routes like `/dashboard`, `/upload`, or `/history`.

### Application Routes

The following routes are defined in the application:

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | `LoginPage` | No | User login |
| `/signup` | `SignupPage` | No | User registration |
| `/dashboard` | `DashboardPage` | Yes | Dashboard overview with statistics |
| `/upload` | `UploadPage` | Yes | Document upload and extraction |
| `/history` | `HistoryPage` | Yes | Document history and management |

Unauthenticated users are redirected to `/login`. The root path `/` redirects to `/dashboard`.

---

## CI/CD Notes

### Automatic Deployments

When you connect your Git repository to Vercel:

- **Production deployments** are triggered automatically on pushes to the `main` (or `master`) branch.
- **Preview deployments** are created for every pull request, giving you a unique URL to test changes before merging.

### Running Tests Before Deployment

Vercel does not run tests by default during the build step. To ensure tests pass before deployment, you have several options:

**Option A: Add tests to the build command**

Update the build command in Vercel project settings:

```
npm run test && npm run build
```

**Option B: Use GitHub Actions (recommended)**

Create a `.github/workflows/ci.yml` file to run tests on every push and pull request:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

**Option C: Use Vercel's Ignored Build Step**

You can configure Vercel to skip builds that don't affect the frontend by adding a script check. This is useful for monorepos but generally not needed for this project.

### Branch-Based Environments

You can configure different environment variables per branch:

- **Production** (`main` branch): Use production values.
- **Preview** (pull request branches): Use staging or test values.
- **Development** (local): Use `.env` or `.env.local` files (not committed to Git).

---

## Troubleshooting

### Common Issues

#### 1. Build Fails with TypeScript Errors

**Symptom**: The build fails during the `tsc --noEmit` step with type errors.

**Solution**:
- Run `npm run build` locally to reproduce the error.
- Fix all TypeScript errors before pushing.
- Ensure your local TypeScript version matches the one in `package.json` devDependencies.

```bash
npx tsc --noEmit
```

#### 2. 404 Errors on Direct Navigation

**Symptom**: Navigating directly to `/dashboard` or refreshing the page returns a 404 error.

**Solution**:
- Verify that `vercel.json` exists in the project root with the SPA rewrite configuration.
- Ensure the file is committed to your Git repository.
- Redeploy after adding or modifying `vercel.json`.

#### 3. Environment Variables Not Working

**Symptom**: The application uses default values instead of configured environment variables.

**Solution**:
- Confirm all variables are prefixed with `VITE_`.
- Verify the variables are set for the correct environment (Production, Preview, or Development) in Vercel settings.
- Redeploy after adding or changing environment variables — they are embedded at build time.
- Check the browser console for the actual values using `import.meta.env`.

#### 4. Blank Page After Deployment

**Symptom**: The deployed site shows a blank white page.

**Solution**:
- Open the browser developer console and check for JavaScript errors.
- Verify the **Output Directory** is set to `dist` in Vercel project settings.
- Ensure `index.html` references the correct script path (`/src/main.tsx` is transformed by Vite during build).
- Check that all dependencies are listed in `package.json` under `dependencies` (not just `devDependencies`) if they are needed at runtime.

#### 5. PDF Extraction Not Working in Production

**Symptom**: PDF text extraction fails in the deployed application but works locally.

**Solution**:
- The `pdfjs-dist` library requires its worker file to be accessible. Vite handles this during the build process.
- Ensure `pdfjs-dist` is listed in `dependencies` (not `devDependencies`) in `package.json`.
- Check the browser console for worker-related errors and verify the worker file is being served correctly.

#### 6. Large File Uploads Failing

**Symptom**: File uploads fail for files near the size limit.

**Solution**:
- This application processes files entirely in the browser — there are no server-side upload limits from Vercel.
- Check the `VITE_MAX_FILE_SIZE_MB` environment variable to ensure it is set to the desired limit.
- For very large files, the browser may run out of memory during extraction. Consider reducing the maximum file size.

#### 7. localStorage Quota Exceeded

**Symptom**: Document saving fails with a quota exceeded error.

**Solution**:
- Browsers typically allow 5–10 MB of localStorage per origin.
- Large extracted texts can fill this quota quickly.
- Delete old documents from the History page to free up space.
- Consider reducing the maximum file size via `VITE_MAX_FILE_SIZE_MB`.

### Getting Help

If you encounter issues not covered here:

1. Check the [Vercel documentation](https://vercel.com/docs).
2. Review the build logs in the Vercel dashboard for specific error messages.
3. Test the build locally with `npm run build` and `npm run preview` to reproduce issues.
4. Open an issue in the project repository with the error details and build logs.