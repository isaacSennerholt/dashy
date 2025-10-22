# Stats Dashboard Specifications (LLM-Optimized)

## Overview
Create a **stats dashboard** web application that displays server metrics in real-time. Metrics are stored on a backend and may be updated at any time. The dashboard must reflect updates automatically without requiring a page refresh.

## Project Setup
- Monorepo structure
- Written in **TypeScript**
- **Next.js** (App Router) for frontend
- **Supabase** for:
  - Database
  - Authentication
  - Edge Functions
  - Realtime (Websockets)
- **Vercel** for hosting
- **GitHub Actions** for CI/CD
- **Vitest** for unit testing
- **ShadCn** for UI components
- **React Query** for frontend API interactions and caching

## Feature Requirements

### 1. Metric Cards
- Each metric card displays:
  - Metric type (string)
  - Metric value (numeric) + unit (e.g., percentage, temperature, sum)
  - Sparkline graph of historical values
  - Action buttons: `Edit`, `History`
- Users can view all metrics without authentication

### 2. Authentication
- Required for creating/updating metrics
- Clicking restricted actions (`Create metric`, `Edit`) triggers authentication modal
- Modal features:
  - Sign in form: email, alias, password
  - Sign up form (toggleable from modal)
  - Backend authentication integration
  - Close modal on successful authentication

### 3. Create Metric
- Authenticated users can create metrics via `Create metric` modal
- Form fields:
  - Metric type (string)
  - Metric value (numeric)
  - Metric unit (select from predefined options)
- Submitting sends data to backend and closes modal

### 4. Update Metric
- Edit mode modal for updating metric value
- Submission:
  - Send metric identifier + new value to backend
  - Save as historical record for history tracking
  - Close modal on success

### 5. Metric History
- `History` button opens modal showing:
  - Min and max values
  - List of all historical values
    - Includes submitting user alias
    - Sorted: latest at top, earliest at bottom

### 6. Real-time Updates
- All users see metric updates in **real-time** via websockets
- 95th percentile latency < 100ms

### 7. Graphs
- Display historical values as sparkline graphs under metric values

### 8. Responsiveness
- Dashboard must be visually optimized for all screen sizes

### 9. Security
- Guard against common vulnerabilities (e.g., injection, XSS, auth bypass)

### 10. Scalability
- Support 100 → 1M users theoretically
- Ensure server failures do not break the app

### 11. Hosting & Deployment
- Run locally and on public hosting
- CI/CD with GitHub Actions:
  - Run unit tests
  - Deploy only if tests pass

### 12. Testing
- Unit tests for all methods
- Create **Testing Strategy Document**:
  - Describe relevant tests (unit, integration, end-to-end)
  - Define integration with CI/CD for future extensibility