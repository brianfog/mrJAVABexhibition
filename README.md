# مستر جواب (MRJAVAB)

An intelligent AI-powered educational assistant that helps users solve math problems, write articles, create quizzes, chat with books, and summarize content.

### Main Features

- **Math Problem Solver**: Solve complex math problems with step-by-step explanations
- **PDF/Article Helper**: Assistance in writing articles and research papers
- **Quiz Maker**: Generate exam questions
- **Book Chat**: Chat with book content
- **Summarizer**: Summarize and extract key points from content
- **Quick & Strong Modes**: Two response modes (quick and strong)
- **File Support**: Upload and process PDF files and images
- **Authentication**: OTP-based login system
- **RTL UI**: Designed for Persian language

## Tech Stack

- **React 19** - UI library
- **React Router v7** - Routing
- **TanStack Query (React Query)** - Data fetching and state management
- **Vite** - Build tool and dev server
- **Google reCAPTCHA v3** - Bot protection
- **Tailwind CSS** - Utility-first CSS (via CDN for model responses)
- **Custom Persian Font** - Yekan Bakh font family

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v10.8.2 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mrjavab-react
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (optional):

```env
VITE_API_BASE_URL=https://new.mrjavab.com/api/
VITE_RECAPTCHA_SITE_KEY=6LeTbNwrAAAAAKacYsGjcgcakDrVu7ea5kCKTafv
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Development Proxy

The project uses Vite proxy configuration for API requests in development:

- `/api` → `https://mrjavab.com/api/`
- `/node-api` → `https://node.mrjavab.com`

## Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Key Features Implementation

### Authentication

- OTP-based login system
- Mobile number verification
- Token management (auth token + chat token)
- Automatic token refresh

### Chat System

- Real-time chat interface
- Support for multiple chat sessions
- File upload (PDF, images)
- Two response modes: Quick and Strong
- HTML-formatted responses with Tailwind CSS
- Message history and persistence

### API Integration

- RESTful API communication
- React Query for data fetching and caching
- Automatic error handling
- Rate limiting support
- CORS proxy configuration for development

## Code Quality

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

All staged files are automatically linted and formatted before commit.
