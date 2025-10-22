# Stats Dashboard

A real-time metrics dashboard application built with Next.js, Supabase, and TypeScript. Track and visualize your metrics with live updates, authentication, and comprehensive history tracking.

## 🚀 Features

- **Real-time Updates**: Live metric updates via Supabase websockets with <100ms latency
- **Authentication**: Secure user authentication with Supabase Auth
- **Metric Management**: Create, edit, and delete metrics with full history tracking
- **Drag & Drop Reordering**: Intuitive metric card reordering with @dnd-kit
- **User Customization**: Persistent metric ordering per user with database storage
- **Interactive Charts**: Sparkline visualizations for metric trends using Recharts
- **Detailed History**: Comprehensive metric history with time-series visualization
- **Responsive Design**: Optimized for all screen sizes with Tailwind CSS
- **Security First**: Input validation, XSS protection, rate limiting, and error boundaries
- **Performance**: Optimized with React Query caching and efficient real-time updates
- **Centralized Logging**: Environment-aware logging system with structured output
- **Error Handling**: Comprehensive error boundaries with user-friendly fallbacks
- **Type Safety**: Full TypeScript implementation with strict mode
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Modern UI**: ShadCn UI components built on Radix UI primitives with accessibility support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: ShadCn UI (built on Radix UI primitives), Tailwind CSS, Lucide Icons
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **Backend**: Supabase (Database, Auth, Realtime, Edge Functions)
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts for sparklines and time-series visualization
- **Date Handling**: date-fns for formatting and manipulation
- **Validation**: Zod for schema validation and type safety
- **Testing**: Vitest, Testing Library, Jest DOM
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📊 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   React Query    │────│   Supabase      │
│   (Frontend)    │    │   (State Mgmt)   │    │   (Backend)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌─────────┐              ┌──────────┐           ┌─────────────┐
    │ ShadCn  │              │ Realtime │           │ Row Level   │
    │UI + Radix│              │ Updates  │           │ Security    │
    └─────────┘              └──────────┘           └─────────────┘
```

### UI Component Architecture

The project uses **ShadCn UI** as the design system, which is built on top of **Radix UI** primitives:

- **Radix UI**: Provides unstyled, accessible component primitives (Dialog, Select, Label, etc.)
- **ShadCn UI**: Adds Tailwind CSS styling and component variants using `class-variance-authority`
- **Styling**: Combined with `tailwind-merge` and `clsx` for dynamic class management
- **Accessibility**: Inherits Radix UI's built-in accessibility features

## 🚦 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **Git** for version control
- **Supabase CLI** (optional, for local development)
- **Docker Desktop** (required for local Supabase development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   > **Where to find these values:**
   > - Go to your Supabase project dashboard
   > - Navigate to Settings → API
   > - Copy the "Project URL" and "anon public" key

4. **Setup Database**
   
   **Local Development (Recommended)**:
   ```bash
   # Start local Supabase instance
   npx supabase start
   
   # Get connection details
   npx supabase status --output json
   ```
   
   Update `.env.local` with the local values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... # Use ANON_KEY from status
   ```
   
   **Production Setup**:
   ```bash
   # Create project at supabase.com
   # Copy migrations from supabase/migrations/ to SQL Editor
   # Configure environment variables in your deployment platform (see Deployment section)
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
   
   > **Note**: If using Supabase CLI, make sure `supabase start` is running in a separate terminal for local development.

## 🏗️ Database Schema

### Tables

- **`user_profiles`**: User information and aliases
- **`metrics`**: Core metrics with types, values, and units
- **`metric_history`**: Historical metric values with timestamps

### Key Features

- Row Level Security (RLS) enabled
- Real-time subscriptions configured
- Automatic history tracking via triggers
- User profile creation on signup

## 🔧 Hooks & Components

### Custom React Hooks

- **`useMetrics`**: Fetch and manage metrics with React Query caching
- **`useCreateMetric`**: Create new metrics with optimistic updates
- **`useUpdateMetric`**: Update metric values with automatic history tracking
- **`useDeleteMetric`**: Delete metrics with confirmation handling
- **`useMetricHistory`**: Fetch metric history for sparkline charts
- **`useMetricHistoryDetailed`**: Fetch detailed history with statistics
- **`useRealtimeMetrics`**: Real-time metric updates via Supabase subscriptions
- **`useMetricOrdering`**: Drag & drop ordering with persistent user preferences
- **`useUserProfile`**: User profile management and authentication state

### Key Components

#### UI Components (ShadCn/Radix)
- **`Button`**: Accessible button component with variants
- **`Input`**: Form input with validation states
- **`Select`**: Dropdown selection component
- **`Dialog`**: Modal dialogs with accessibility
- **`Card`**: Container component for metric display

#### Business Components
- **`DashboardHeader`**: Navigation and user controls
- **`MetricsGrid`**: Sortable grid with drag & drop support
- **`MetricCard`**: Individual metric display with sparkline
- **`Sparkline`**: Real-time chart visualization using Recharts
- **`AuthModal`**: Sign-in/sign-up authentication flow
- **`CreateMetricModal`**: New metric creation form
- **`EditMetricModal`**: Metric value editing interface
- **`MetricHistoryModal`**: Detailed history viewer with statistics

#### Error Handling
- **`ErrorBoundary`**: Application-level error catching
- **`MetricsErrorBoundary`**: Specialized error handling for metrics

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Test with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Testing Strategy

The project includes comprehensive testing at multiple levels:

- **Unit Tests**: Components, utilities, validation schemas
- **Integration Tests**: API interactions, state management
- **Security Tests**: Input validation, XSS prevention
- **Performance Tests**: Load times, real-time latency

See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for detailed testing documentation.

## 🔒 Security

### Implemented Security Measures

- **Input Validation**: Zod schemas for all user inputs with strict type checking
- **XSS Protection**: HTML sanitization functions and CSP headers
- **Rate Limiting**: Email-based rate limiting for authentication (5 attempts/minute)
- **Authentication**: Secure JWT tokens via Supabase Auth
- **Database Security**: Row Level Security (RLS) policies with user-specific access
- **Input Sanitization**: Custom sanitization functions for strings and numbers
- **Error Boundaries**: React error boundaries with Supabase-specific error handling
- **HTTPS**: Enforced in production with security headers

### Security Headers

```javascript
// Automatically configured via Vercel
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## 📈 Performance

### Optimization Features

- **React Query Caching**: Intelligent data fetching and caching
- **Real-time Updates**: Efficient websocket connections
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Size monitoring in CI/CD

### Performance Targets

- **Page Load**: < 2 seconds
- **Real-time Updates**: < 100ms latency
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90

## 🚀 Deployment

### Environment-Specific API Keys

| Environment | URL Format | API Key Format | Source |
|-------------|------------|----------------|---------|
| **Local Development** | `http://127.0.0.1:54321` | JWT token (`eyJ...`) | `npx supabase status --output json` → `ANON_KEY` |
| **Production** | `https://[project].supabase.co` | Publishable key (`sb_publishable_...`) | Supabase Dashboard → Settings → API → anon public |

> **Why Different Formats?**
> - **Local CLI**: Only provides JWT tokens for security isolation
> - **Production**: Uses modern publishable keys with enhanced security features

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Connect your GitHub repository

2. **Configure Environment Variables**
   
   In your Vercel project dashboard, add these environment variables:
   
   Get your **production** credentials from Supabase Dashboard → Settings → API:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[your-production-key]
   ```
   
   > **Important**: 
   > - Add these in **Vercel Dashboard** → Project Settings → Environment Variables
   > - Use the **publishable key** (`sb_publishable_...`) for production, NOT the JWT token used in local development
   > - Never commit production credentials to `.env.local` or version control

3. **Deploy**
   - Automatic deployments on git push
   
4. **GitHub Actions Integration**
   
   For CI/CD, add the same environment variables as **GitHub repository secrets**:
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add secrets:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `VERCEL_TOKEN` (from Vercel account settings)
     - `VERCEL_ORG_ID` (from Vercel project settings)
     - `VERCEL_PROJECT_ID` (from Vercel project settings)

### CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **Code Quality**: Linting, type checking, security scans
- **Testing**: Unit tests with coverage reporting
- **Building**: Production build verification
- **Deployment**: Automatic deployment to Vercel

## 📝 Data Operations

### Metric Operations via Supabase Client

The application uses Supabase client SDK for all data operations. Here are the key operations:

```typescript
// Create Metric (via useCreateMetric hook)
const createMetric = useCreateMetric()
createMetric.mutate({
  type: "CPU Usage",
  value: 75.5,
  unit: "percentage"
})

// Update Metric (via useUpdateMetric hook)
const updateMetric = useUpdateMetric()
updateMetric.mutate({
  id: "metric-id",
  data: { value: 80.2 }
})

// Get Metrics (via useMetrics hook)
const { data: metrics } = useMetrics()

// Get Metric History (via useMetricHistory hook)
const { data: history } = useMetricHistory("metric-id")
```

### Supported Units

- `percentage` - 0-100 values
- `temperature` - Celsius degrees
- `count` - Integer counts
- `bytes` - Data storage sizes
- `seconds` / `milliseconds` - Time measurements
- `currency` - Monetary values

## 🤝 Contributing

### Development Workflow

1. **Fork and Clone**: Fork the repository and clone locally
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop**: Make your changes with tests
4. **Test**: Run the full test suite (`npm test`)
5. **Commit**: Commit with conventional commit messages
6. **Push**: Push to your fork and create a pull request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Follow the existing code style
5. Request review from maintainers

## 📄 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Quality Assurance
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI interface
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables in `.env.local`
   - Check Supabase project status in dashboard
   - Confirm API keys are correct (URL should start with `https://` and key should be a long string)
   - If using Supabase CLI, ensure `npx supabase start` is running

2. **Realtime/WebSocket Connection Issues**
   
   **Local Development:**
   - **Most common cause**: Using wrong API key format
   - Use `npx supabase status --output json` to get the `ANON_KEY` (JWT format)
   - JWT tokens start with `eyJ`, NOT `sb_publishable_`
   - Update `.env.local` with the correct `ANON_KEY`
   - Restart your dev server after changing environment variables
   
   **Production:**
   - Use publishable key (`sb_publishable_...`) from Supabase Dashboard
   - Verify the key is correctly set in Vercel environment variables
   - Check browser console for WebSocket connection errors
   - Ensure your production Supabase project has realtime enabled

3. **Supabase CLI Issues**
   - Use `npx supabase` instead of global installation
   - If Homebrew version is outdated, use npx for latest features
   - Ensure Docker Desktop is running for local development

4. **Build Failures**
   - Run `npm run type-check` to identify TypeScript errors
   - Ensure all dependencies are installed with `npm install`
   - Check for syntax errors in recent changes
   - Verify environment variables are set correctly

5. **Test Failures**
   - Run tests individually to isolate issues: `npm test -- specific-test-file`
   - Check for missing test dependencies
   - Verify mock configurations in test setup
   - Ensure test database is properly configured

6. **Local Development Issues**
   - If using Supabase CLI, make sure Docker is running
   - Check that ports 54321 and 54322 are not in use
   - Restart Supabase with `npx supabase stop` then `npx supabase start`

### Getting Help

- **Issues**: Create a GitHub issue for bugs or feature requests
- **Documentation**: Check the [Testing Strategy](./TESTING_STRATEGY.md) for testing guidance
- **Supabase Docs**: Visit [Supabase Documentation](https://supabase.com/docs) for backend setup help

## 📚 Documentation

- [Testing Strategy](./TESTING_STRATEGY.md) - Comprehensive testing approach

## 📜 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [ShadCn/UI](https://ui.shadcn.com/) - UI component library
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for real-time metrics visualization**