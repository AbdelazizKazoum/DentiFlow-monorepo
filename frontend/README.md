# DentiFlow Frontend

This is the Next.js 16 frontend application for the DentiFlow Dental Clinic Operations platform.
Built with Next.js App Router, Tailwind CSS v4, MUI v9, and Framer Motion.

## Setup Instructions

1. Ensure Node.js v20+ is installed (Using \`pnpm\` is recommended).
2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

- **Clean Architecture:** Domain (`src/domain`), Application (`src/application`), Infrastructure (`src/infrastructure`), Presentation (`src/presentation`).
- **Styling Overview:**
  - Tailwind CSS handles layout and utility spacing.
  - Material UI (v9) component library wrapped internally with Emotion.
  - \`AppThemeProvider\` manages dual RTL/LTR caching alongside Tailwind styles.
- **RTL/LTR Support:**
  - Modify \`<html dir="rtl">\` in \`src/app/layout.tsx\` or based on locale setting.
  - MUI generates rtl-prefixed CSS via \`stylis-plugin-rtl\`.
  - Direction validation ensures only 'ltr' or 'rtl' are accepted.

## Testing

Jest and React Testing Library are configured.
\`\`\`bash
pnpm test
\`\`\`

## Development Notes

- Theme tokens are defined in \`src/infrastructure/theme/ThemeRegistry.tsx\`.
- Page transitions use Framer Motion for smooth animations.
- Direction is currently hardcoded to 'ltr' but can be made configurable via user preferences or locale.
