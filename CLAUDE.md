# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resume Redactor is a privacy-focused web application for HR professionals that parses resume PDFs to extract personal information and redacts sensitive fields by overlaying black boxes on the original PDF. All processing happens client-side for maximum privacy.

This project uses parts of OpenResume (by xitanggg) under the AGPL-3.0 license.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

Development server runs at http://localhost:3000

## Technology Stack

- **Framework**: Next.js 15.5.3 (App Router) with Turbopack
- **Frontend**: React 19.1.0, TypeScript 5
- **PDF Processing**:
  - `pdfjs-dist` v5.4.149 for parsing/reading PDFs
  - `pdf-lib` v1.17.1 for modifying PDFs
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit (imported but minimally used)
- **UI Libraries**: react-select, react-dropzone, @heroicons/react, lucide-react

## Architecture Overview

### Directory Structure

```
app/
├── components/          # React UI components
├── lib/
│   ├── parse-resume-from-pdf/    # Four-stage PDF parsing pipeline
│   ├── modify-pdf/               # PDF redaction via pdf-lib
│   ├── redux/                    # Redux store (minimal usage)
│   └── utils/                    # Helper utilities
├── page.tsx            # Main home page (file upload + redaction UI)
├── layout.tsx          # Root layout
└── globals.css         # Tailwind configuration
public/                 # Static assets (PDF.js worker required here)
types/                  # Global TypeScript type definitions
```

### Import Paths

TypeScript is configured with `baseUrl: "./app"` to simplify imports:

```typescript
// Use these patterns:
import { modifyPdf } from 'lib/modify-pdf'
import Button from 'components/Button'
import type { Resume } from 'lib/parse-resume-from-pdf/types'

// Access public directory:
import 'public/some-file.js'  // Maps to ../../public/some-file.js
```

## Core PDF Processing Architecture

### Four-Stage Parsing Pipeline

The PDF parsing follows a structured data transformation approach (adapted from OpenResume):

**Stage 1: `readPdf()`**
- Extracts raw `TextItem[]` from PDF using pdfjs-dist
- Each item contains: text content, coordinates (x, y), font info, hasEOL marker, pageNumber
- Custom adapter adds `pageNumber` tracking for multi-page support

**Stage 2: `groupTextItemsIntoLines()`**
- Groups TextItems into logical lines using hasEOL markers
- Merges adjacent items within typical character width (reduces PDF artifacts)
- Computes "typical character width" by analyzing most common font/height

**Stage 3: `groupLinesIntoSections()`**
- Identifies section headers (EDUCATION, EXPERIENCE, etc.)
- Primary heuristic: BOLD + ALL UPPERCASE text
- Fallback: keyword matching with formatting rules
- Groups lines under their nearest section header

**Stage 4: `extractResumeFromSections()`**
- Extracts specific resume fields using feature scoring system
- Profile extraction: name, email, phone, location, URL
- Education extraction: supports multiple schools via subsection division

### Feature Scoring System

Non-obvious ML-like pattern for text field recognition:

```typescript
// Each resume field has custom FeatureSet[] arrays
// FeatureSet = [matchFunction, score, returnMatchingText?]

// Example: Email detection
EMAIL_FEATURE_SETS = [
  [matchEmail, 4, true],    // Regex match: +4 points
  [hasAt, 2],               // Contains '@': +2 points
  [hasNumber, -2],          // Has digits: -2 (emails rarely numeric)
  [isBold, -1],             // Bold text: -1 (emails rarely bold)
]

// Algorithm:
// 1. Run each TextItem through all feature sets
// 2. Sum scores for each item
// 3. Return TextItem with highest score
// 4. If score ≤ 0, return empty string
```

Allows flexible, heuristic-based matching without ML models. To add new extractable fields (like Skills), define new feature sets in `extract-resume-from-sections/`.

### Multi-Education Support

The `divideEducationIntoSubsections()` function splits education sections by school keyword presence, enabling proper parsing of resumes with multiple degrees. Each subsection is independently processed to extract school, degree, graduation date, and GPA.

The `fixExtractedItemCoordinates()` function ensures coordinates are accurate for rendering redaction boxes over the correct text.

### PDF Redaction Mechanism

Uses pdf-lib to create form fields (not just overlays):

```typescript
// modifyPdf() flow:
1. Parse resume to extract field coordinates via parseResumeFromPdf()
2. Load PDF bytes with PDFDocument.load()
3. For each selected redaction field:
   - Create read-only text field at exact coordinates
   - Set background to black (rgb(0, 0, 0))
   - Add to appropriate page
4. Save modified PDF as blob
5. Return object URL for browser display
```

Redaction creates **durable, interactive form fields**, not temporary overlays.

## Important Implementation Details

### PDF.js Worker Setup
The application requires `pdf.worker.min.js` in the `/public` directory. This worker file must match the pdfjs-dist version (currently v5.4.149).

### Coordinate System
PDF.js uses bottom-left origin (0,0 at bottom-left), not top-left. Coordinates are extracted from transformation matrices (`transform[4]` = x, `transform[5]` = y).

### Multi-Page Resume Support
The architecture properly handles multi-page resumes through pageNumber tracking added to TextItems during the readPdf() stage.

### Adaptive Text Merging
Smart space insertion prevents text corruption when merging adjacent items:
- Inserts space after punctuation (`:`, `,`, `.`, `|`)
- Inserts space before bullet points if not preceded by space
- Prevents double-spaces

### Location Validation
Location matching validates against `VALID_LOCATIONS` constant (US states/Canadian provinces). Handles formats like "City, State" or "City, State, Country".

## Data Flow

```
User uploads PDF
    ↓
ResumeDropzone component (react-dropzone)
    ├─ URL.createObjectURL(file)
    └─ onFileUrlChange(fileUrl)
        ↓
page.tsx state (fileUrl)
    ↓
ResumeViewer displays original PDF (iframe)
    ↓
User selects redaction fields via react-select
    └─ handleRedactionChange() updates state
        ↓
User clicks "Modify PDF"
    └─ modifyPdf(fileUrl, selectedFields)
        ├─ parseResumeFromPdf() runs 4-stage pipeline
        ├─ Fetch PDF bytes
        ├─ For each field: addRedactedField(page, coordinates)
        └─ Return object URL
            ↓
ModifiedResumeViewer displays redacted PDF (iframe)
```

**All processing is client-side** - no backend servers involved, ensuring user privacy.

## Code Conventions

- **Strict TypeScript**: All code uses strict mode
- **No Redux in practice**: Despite imports, state is managed via React hooks (useState) in page.tsx
- **Feature-based organization**: Parse pipeline split into logical stages, each in separate files
- **Coordinate precision critical**: All field locations must be pixel-perfect for proper redaction
- **Heuristic-based extraction**: Prefer feature scoring over hardcoded rules for flexibility
