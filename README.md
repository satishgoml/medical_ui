# Medical Diagnosis UI

A modern web application built with Next.js for medical diagnosis and consultation. This UI interfaces with a backend service to provide real-time medical assessments and recommendations through an intelligent agent-based system.

## Features

- Real-time medical diagnosis processing
- Multi-agent workflow system
- Markdown support for rich text responses
- Interactive diagnosis form
- Step-by-step diagnosis plan visualization
- Real-time progress tracking
- Responsive design with dark/light mode support

## Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm
- Backend service running on http://localhost:8000

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Configure the environment:
   Make sure your backend service is running on http://localhost:8000

4. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
app/                  - Next.js app directory
  page.tsx           - Main diagnosis page
components/          - React components
  diagnosis/         - Diagnosis-specific components
  ui/               - Shared UI components
hooks/              - Custom React hooks
lib/                - Utility functions
```

## Technology Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown Rendering

## Development

The application uses Next.js's new App Router and Server Components. The main diagnosis interface is located in `app/page.tsx`, which handles:

- Real-time communication with the backend
- State management for the diagnosis workflow
- Rendering of diagnosis results and recommendations
- Step-by-step execution tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
