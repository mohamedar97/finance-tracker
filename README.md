# Finance Tracker

A modern, AI-powered personal finance management application built with Next.js.

## Overview

Finance Tracker helps you manage your personal finances with intelligent insights and comprehensive tracking tools. Monitor accounts, track spending, analyze financial health, and get AI-powered recommendations—all in one secure, user-friendly platform.

## Features

- **Multi-currency Support**: Track finances in USD, EGP, and Gold
- **Account Management**: Create and manage different account types (checking, savings, investments)
- **Assets & Liabilities**: Track both your assets and debts in one place
- **Transaction Tracking**: Log and categorize income and expenses
- **Installment Planning**: Manage and track installment payments
- **Financial Snapshots**: Capture your financial position over time
- **Interactive Dashboard**: Visualize your financial health with charts and summaries
- **AI-Powered Insights**: Get personalized financial advice and insights
- **Secure Authentication**: Protect your financial data with robust user authentication

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **UI Components**: Shadcn UI
- **AI Integration**: Claude by Anthropic, Tavily search API
- **Data Visualization**: Recharts
- **State Management**: React Hooks and Context API

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8.15.4 or later)
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/finance_tracker
AUTH_SECRET=your-auth-secret
ANTHROPIC_API_KEY=your-anthropic-api-key
TAVILY_API_KEY=your-tavily-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Set up the database:

```bash
pnpm db:push
```

5. Start the development server:

```bash
pnpm dev
```

6. Open http://localhost:3000 in your browser to see the application.

## Development

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm preview` - Build and start the production server
- `pnpm check` - Run linting and type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with automatic fixes
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format:write` - Format code with Prettier
- `pnpm format:check` - Check code formatting with Prettier

### Database Management

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema changes to the database
- `pnpm db:studio` - Open Drizzle Studio to visualize and manage your database

## Project Structure

- `src/app` - Next.js app router pages and layouts
- `src/components` - Reusable React components
- `src/server` - Server-side code including API routes and database functions
- `src/styles` - Global CSS and Tailwind configuration
- `src/lib` - Utility functions and shared code
- `src/server/db` - Database schema and configuration
- `src/server/auth` - Authentication configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
