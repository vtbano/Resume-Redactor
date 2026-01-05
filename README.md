# Resume Redactor

A privacy-focused web application for HR professionals that parses resume PDFs to extract personal information and redacts sensitive fields by overlaying black boxes on the original PDF. All processing happens client-side for maximum privacy.

## Features

- **Client-Side Processing**: All PDF parsing and redaction happens in your browser - no data is sent to any server
- **Smart Resume Parsing**: Automatically extracts personal information using a feature-scoring algorithm
- **Selective Redaction**: Choose which fields to redact (name, email, phone, location, URL)
- **Multi-Page Support**: Handles resumes with multiple pages
- **Multi-Education Support**: Correctly parses resumes with multiple degrees/schools

## Technology Stack

- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **Frontend**: React 19.1.0, TypeScript 5
- **PDF Processing**:
  - `pdfjs-dist` v5.4.149 for parsing/reading PDFs
  - `pdf-lib` v1.17.1 for modifying PDFs
- **Styling**: Tailwind CSS v4
- **UI Libraries**: react-select, react-dropzone, @heroicons/react, lucide-react

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd resume-redactor
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Other Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## How to Use

1. **Upload a Resume**: Drag and drop a PDF resume or click to browse
2. **Select Fields to Redact**: Choose which fields you want to redact (name, email, phone, etc.)
3. **Generate Redacted PDF**: Click "Modify PDF" to create a redacted version
4. **Custom Word Redaction**: If there additional words that weren't captured in the first redaction, add specific words you want to redact.
   Click the "Custom Word Redaction" button to redact the other words to redact.
   **Note on Custom Word Redaction**: Sometimes the word you redact may not be picked-up and that is due to the parsing with `pdfjs-dist`.
5. **Download**: Download the redacted PDF with black boxes covering selected information

## How It Works

Resume Redactor focuses on accurate redaction of sensitive information in PDF resumes. The application combines intelligent parsing (adapted from OpenResume) with custom redaction algorithms.

### Parsing Pipeline

The app uses a four-stage parsing pipeline to extract personal information:

1. **PDF Reading**: Extracts raw text items with coordinates, font info, and page numbers using PDF.js
2. **Line Grouping**: Groups text items into logical lines with smart space insertion
3. **Section Detection**: Identifies resume sections using bold/uppercase heuristics
4. **Information Extraction**: Uses a feature-scoring algorithm to identify fields like name, email, phone, etc.

### Redaction System

The core innovation of Resume Redactor is its precise, multi-layered redaction system:

#### 1. Coordinate Fixing System

When text is extracted (e.g., "John" from "John Doe"), PDF.js often returns coordinates for the entire text block, not just the extracted substring. The **`fixExtractedItemCoordinates`** function solves this:

```typescript
// If "John" is extracted from "John Doe" at x=100, width=80
// Calculate: charWidth = 80 / 8 = 10 pixels per character
// Find "John" position: x = 100 + (0 * 10) = 100
// Apply corrections for precise coverage:
//   - Left correction: charWidth * 0.5 for edge coverage
//   - Width: "John".length * charWidth + padding buffer
```

This ensures redaction boxes precisely cover only the intended text, not the entire line.

#### 2. Durable PDF Redaction

Unlike simple overlay approaches, Resume Redactor creates **permanent form fields** using pdf-lib:

```typescript
// Creates read-only text fields with black backgrounds
field.enableReadOnly()
field.addToPage(page, {
  x: calculatedX,
  y: calculatedY,
  width: preciseWidth,
  height: textHeight,
  backgroundColor: rgb(0, 0, 0), // Solid black
  borderWidth: 0,
})
```

These form fields become part of the PDF structure, ensuring redactions persist even if the PDF is edited or printed.

#### 3. Custom Word Redaction

For edge cases where automatic parsing misses certain words (due to unusual PDF formatting or fonts), the **Custom Word Redaction** feature allows manual targeting:

**How it works:**

- Takes the already-redacted PDF and re-parses it to extract all text items
- Searches for user-specified words using regex with word boundaries (`\b`)
- Handles both exact matches and substring matches
- For substring matches, calculates precise coordinates using character width analysis
- Applies the same coordinate fixing algorithm for pixel-perfect coverage

**Limitations:**

- Words must exist as extractable text (not images)
- PDF.js parsing limitations may affect detection of text with unusual encoding
- Some fonts or formatting may cause text to be split across multiple items

#### 4. Multi-Page Support

All redaction functions track `pageNumber` for each text item, ensuring accurate redaction across multi-page resumes. Redaction boxes are applied to the correct page using:

### Redaction Workflow

```
1. Upload PDF → Parse with PDF.js
2. Extract coordinates for each text item
3. Identify personal info via feature scoring
4. Fix coordinates for substring matches
5. Create form fields at precise locations
6. (Optional) Custom word redaction with re-parsing
7. Save modified PDF with embedded redactions
```

## Privacy & Security

- **100% Client-Side**: No resume data ever leaves your browser
- **No Backend**: All processing happens locally
- **No Tracking**: No analytics or third-party scripts
- **No Storage**: Files are not saved or cached anywhere

## License

This project uses parts of [OpenResume](https://github.com/xitanggg/open-resume) by xitanggg under the AGPL-3.0 license.

© 2024 xitanggg (or original authors), licensed under AGPL-3.0
