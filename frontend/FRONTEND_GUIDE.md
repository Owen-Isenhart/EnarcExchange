/**
 * Frontend Setup & Architecture Guide
 * EnarcExchange - Modern Prediction Market Frontend
 */

# Frontend Implementation Complete ✅

## What's Been Built

### 1. **Core Infrastructure**
- ✅ TypeScript types & models (`/types/models.ts`, `/types/api.ts`)
- ✅ Zod validation schemas (`/utils/validators.ts`)
- ✅ Utility functions (formatting, helpers, etc.)
- ✅ API configuration & endpoints (`/config/api.ts`)
- ✅ Query client setup for React Query

### 2. **API Layer**
- ✅ Axios-based API client with interceptors (`/services/apiClient.ts`)
- ✅ Service modules:
  - `authService` - Authentication
  - `marketsService` - Market operations
  - `outcomesService` - Market outcomes
  - `betsService` - Betting operations
  - `usersService` - User data
  - `pricesService` - Price data
  - `transactionsService` - Transactions
- ✅ Automatic JWT token injection
- ✅ 401 error handling with auto-logout
- ✅ Idempotency key support for bets

### 3. **State Management**
**Zustand Stores:**
- ✅ `authStore` - User authentication & session
- ✅ `uiStore` - UI state (modals, notifications, sidebar)

**React Query Hooks:**
- ✅ `useAuth` - Authentication & user data
- ✅ `useMarkets` - Market queries & mutations
- ✅ `useBets` - Bet operations
- ✅ `useUser` - User profile & stats
- ✅ `useLocalStorage` - Persistent state
- ✅ `useDebounce` - Debounced values

### 4. **Component Library** (Shadcn/ui-inspired)
Base UI Components:
- ✅ `Button` - Multiple variants (primary, secondary, danger, ghost)
- ✅ `Card` - Container with composable sections
- ✅ `Input` - Text inputs with labels & error states
- ✅ `TextArea` - Multi-line text input
- ✅ `Badge` - Status indicators
- ✅ `Skeleton` - Loading placeholders
- ✅ `Table` - Data tables
- ✅ `Modal` - Dialog overlays

Layout Components:
- ✅ `Header` - Top navigation with auth
- ✅ `Sidebar` - Navigation menu
- ✅ `NotificationCenter` - Toast notifications
- ✅ `Providers` - App-wide provider wrapper

### 5. **Example Pages**
- ✅ `/` - Home landing page
- ✅ `/login` - User login
- ✅ `/signup` - User registration
- ✅ `/dashboard` - User dashboard with stats
- ✅ `/markets` - Markets listing with search & pagination
- ✅ `/markets/[id]` - Market detail page with betting

### 6. **Design System**
- ✅ **Dark Theme** - #050505 background, white text
- ✅ **Colors:**
  - Primary/Success: Neon Green #00FF41
  - Alert: Vibrant Orange #FF8C00
- ✅ **Fonts:** JetBrains Mono for numerical data
- ✅ **Styling:**
  - Tailwind utilities with custom theme
  - 1px borders (white/10)
  - Glassmorphism effects (backdrop-blur)
  - Subtle background grid pattern
  - Monospaced font utilities for numbers/timestamps
- ✅ **Animations:** Smooth transitions & toast animations

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   └── page.tsx
│   ├── (markets)/                # Markets route group
│   │   ├── page.tsx              # Markets listing
│   │   └── [id]/page.tsx         # Market detail
│   ├── layout.tsx                # Root layout with Providers
│   ├── globals.css               # Design system styles
│   └── page.tsx                  # Home landing page
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layouts/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── NotificationCenter.tsx
│   │   └── index.ts
│   ├── Providers.tsx             # Provider wrapper
│   └── features/                 # Feature-specific components (TODO)
│
├── services/                     # API layer
│   ├── apiClient.ts
│   ├── auth.service.ts
│   ├── markets.service.ts
│   ├── bets.service.ts
│   ├── users.service.ts
│   ├── outcomes.service.ts
│   ├── prices.service.ts
│   ├── transactions.service.ts
│   └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useMarkets.ts
│   ├── useBets.ts
│   ├── useUser.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── index.ts
│
├── store/                        # Zustand state
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── types/                        # TypeScript definitions
│   ├── models.ts                 # Core domain models
│   ├── api.ts                    # API request/response types
│   └── index.ts
│
├── utils/
│   ├── validators.ts             # Zod schemas
│   ├── formatting.ts             # Display formatters
│   ├── helpers.ts                # Utility functions
│   └── index.ts
│
├── config/
│   └── api.ts                    # API config & endpoints
│
├── lib/
│   └── queryClient.ts            # React Query setup
│
├── public/                       # Static assets
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config
└── eslint.config.mjs             # ESLint config
```

## To Get Started

### 1. **Install Dependencies**
```bash
cd frontend
pnpm install
```

### 2. **Set Environment Variables**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. **Start Development Server**
```bash
pnpm dev
```
Visit: http://localhost:3001 (or wherever dev server runs)

### 4. **Build for Production**
```bash
pnpm build
pnpm start
```

## Key Features Implemented

### Authentication Flow
- Form validation with Zod
- JWT token storage in localStorage
- Automatic token injection in requests
- Auto-logout on 401 errors
- Protected routes ready for implementation

### Data Fetching
- React Query for server state management
- Automatic caching with configurable stale times
- Optimistic updates for mutations
- Error handling & notifications
- Auto-refetch on network recovery

### Real-Time Updates
- Refetch intervals for price data (30s)
- Manual refetch triggers
- Batch query invalidation

### Form Handling
- Client-side validation (Zod)
- Error display on inputs
- Loading states
- Accessibility (labels, error messages)

### Notifications
- Automatic toast notifications
- Auto-dismiss with customizable duration
- Success/error/warning/info variants
- Positioned at bottom-right

## What Still Needs Implementation

### Pages & Features
- [ ] Create market form page
- [ ] Admin dashboard
- [ ] Market resolution page
- [ ] User profile page
- [ ] Portfolio page with more detailed views
- [ ] Transaction history page
- [ ] Settings/preferences page
- [ ] 404/error pages

### Components
- [ ] Price chart component (could use Recharts)
- [ ] Market card variants
- [ ] Position list component
- [ ] Transaction list component
- [ ] Modal variants (confirm, alert, etc.)
- [ ] Form components (select, checkbox, radio, etc.)

### Enhancements
- [ ] Error boundaries
- [ ] Loading suspense boundaries
- [ ] Optimistic UI updates
- [ ] Real-time WebSocket data (if needed)
- [ ] Advanced filtering/sorting
- [ ] Export data functionality
- [ ] Responsive image optimization

### Testing
- [ ] Unit tests (Jest + React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Cypress/Playwright)

### SEO & Performance
- [ ] Metadata optimization
- [ ] Open Graph tags
- [ ] Sitemap
- [ ] Performance monitoring
- [ ] Bundle analysis

## Best Practices Implemented

✅ **Code Organization**
- Clear separation of concerns
- Modular component structure
- Centralized state management
- Service layer abstraction

✅ **Type Safety**
- Strict TypeScript configuration
- End-to-end type safety
- Zod runtime validation
- Proper error typing

✅ **Performance**
- React Query caching
- Lazy loading with dynamic imports (ready)
- Image optimization (next/image)
- Memoization ready
- Skeletal loading states

✅ **Accessibility**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

✅ **Maintainability**
- JSDoc comments on complex functions
- Consistent naming conventions
- Reusable component composition
- Environment configuration

## Testing the Setup

1. **Login Flow:**
   - Navigate to `/login`
   - Enter test credentials
   - Should redirect to `/dashboard` on success

2. **Markets Listing:**
   - Navigate to `/markets`
   - Should display market cards
   - Search functionality should work
   - Click market to view details

3. **State Persistence:**
   - Login and refresh page
   - User should remain logged in
   - Token should be in localStorage

4. **Error Handling:**
   - Try login with invalid credentials
   - Error toast should appear
   - Form error states should show

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Components Layer                      │
│  (Button, Card, Input, Badge, Skeleton, Table, Modal)     │
└─────────────────────────────────────────────────────────────┘
                           ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                          │
│  (dashboard, markets, market/[id], login, signup)          │
└─────────────────────────────────────────────────────────────┘
           ↑                           ↑
    ┌──────┴──────┐           ┌───────┴─────────┐
    ↓             ↓           ↓                 ↓
┌────────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐
│Custom Hooks│ │  Stores  │ │React Query   │ │ Services   │
│  (useAuth, │ │(authStore│ │   (cache)    │ │(API calls) │
│ useMarkets)│ │ uiStore)│ │              │ │            │
└────────────┘ └──────────┘ └──────────────┘ └────────────┘
                                   ↑
                           ┌───────┴────────┐
                           ↓                ↓
                    ┌──────────────┐ ┌──────────────┐
                    │ API Client   │ │ Validators   │
                    │  (axios)     │ │   (Zod)      │
                    └──────────────┘ └──────────────┘
                           ↓
                    ┌──────────────┐
                    │Backend API   │
                    │(localhost:   │
                    │3000)         │
                    └──────────────┘
```

## Next Steps

1. **Install dependencies:** `pnpm install`
2. **Start dev server:** `pnpm dev`
3. **Test authentication flow**
4. **Implement remaining pages**
5. **Add unit tests**
6. **Deploy to production**

---

**Built with:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand
- TanStack React Query
- Zod
- Axios
- Lucide React

---

For questions or assistance, refer to the inline comments in each file and the Backend API documentation.
