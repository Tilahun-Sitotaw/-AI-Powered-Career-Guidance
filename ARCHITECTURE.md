# 🏗️ CareerPath AI - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                   http://localhost:5173/                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    VITE DEV SERVER                               │
│                    (Port 5173)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              REACT APPLICATION                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              React Router                          │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Routes:                                     │  │  │   │
│  │  │  │  • / → Home                                  │  │  │   │
│  │  │  │  • /login → Login                            │  │  │   │
│  │  │  │  • /register → Register                      │  │  │   │
│  │  │  │  • /dashboard → Dashboard (Protected)        │  │  │   │
│  │  │  │  • /profile → Profile (Protected)            │  │  │   │
│  │  │  │  • /recommendations → Recommendations (Prot) │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  │                                                     │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Components:                                 │  │  │   │
│  │  │  │  • Header (Navigation)                       │  │  │   │
│  │  │  │  • Sidebar (Desktop Nav)                     │  │  │   │
│  │  │  │  • Footer (Footer)                           │  │  │   │
│  │  │  │  • PrivateRoute (Protection)                 │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Styling:                                          │  │   │
│  │  │  • Tailwind CSS (Utility-first CSS)               │  │   │
│  │  │  • PostCSS (CSS Processing)                       │  │   │
│  │  │  • Custom Animations                              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Libraries:                                        │  │   │
│  │  │  • React Icons (Icons)                             │  │   │
│  │  │  • Recharts (Charts)                               │  │   │
│  │  │  • Axios (HTTP Client)                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  State Management:                                       │   │
│  │  • React Hooks (useState, useEffect)                    │   │
│  │  • localStorage (Token Storage)                         │   │
│  │  • Context API (if needed)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    API Proxy (Vite)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND                               │
│                    (Port 5000)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Routes                                  │   │
│  │  • POST /api/auth/login                                 │   │
│  │  • POST /api/auth/register                              │   │
│  │  • GET /api/profile                                     │   │
│  │  • PUT /api/profile                                     │   │
│  │  • GET /api/recommendations                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Middleware                                  │   │
│  │  • Authentication (JWT)                                 │   │
│  │  • Error Handling                                       │   │
│  │  • CORS                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Models                                      │   │
│  │  • User Model                                           │   │
│  │  • Recommendation Model                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Collections:                                            │   │
│  │  • users (User data)                                    │   │
│  │  • recommendations (Career recommendations)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: Home Page                              │
│                    (Public Route)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │  Click "Login"   │  │ Click "Register" │
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │   Login Page     │  │  Register Page   │
        │  (Public Route)  │  │  (Public Route)  │
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Enter Credentials│  │ Fill Form        │
        │ Click "Login"    │  │ Click "Register" │
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ API Call         │  │ API Call         │
        │ /api/auth/login  │  │ /api/auth/register
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Token Received   │  │ Account Created  │
        │ Stored in        │  │ Redirect to      │
        │ localStorage     │  │ Login            │
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
                ┌─────────────────────────────┐
                │  isAuthenticated = true     │
                │  Redirect to Dashboard      │
                └─────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │         Protected Routes Available      │
        │  ┌──────────────────────────────────┐   │
        │  │ • Dashboard (/dashboard)         │   │
        │  │ • Profile (/profile)             │   │
        │  │ • Recommendations (/recommend)   │   │
        │  └──────────────────────────────────┘   │
        └─────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │   Dashboard      │  │    Profile       │
        │  View Stats      │  │  Edit Profile    │
        │  View Progress   │  │  View Skills     │
        └──────────────────┘  └──────────────────┘
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
                ┌─────────────────────────────┐
                │  Recommendations Page       │
                │  View Career Paths          │
                │  View Skill Gaps            │
                │  View Learning Resources    │
                └─────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │  Click "Logout"             │
                │  Token Removed              │
                │  Redirect to Home           │
                └─────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── Router
│   ├── Route: /
│   │   └── Home
│   │       ├── Header
│   │       ├── Main Content
│   │       └── Footer
│   │
│   ├── Route: /login
│   │   └── Login
│   │       ├── Header
│   │       ├── Login Form
│   │       └── Footer
│   │
│   ├── Route: /register
│   │   └── Register
│   │       ├── Header
│   │       ├── Register Form
│   │       └── Footer
│   │
│   ├── Route: /dashboard (Protected)
│   │   └── PrivateRoute
│   │       └── Dashboard
│   │           ├── Header
│   │           ├── Sidebar
│   │           ├── Main Content
│   │           │   ├── Statistics Cards
│   │           │   ├── Charts
│   │           │   └── Quick Actions
│   │           └── Footer
│   │
│   ├── Route: /profile (Protected)
│   │   └── PrivateRoute
│   │       └── Profile
│   │           ├── Header
│   │           ├── Sidebar
│   │           ├── Profile Form
│   │           ├── Skills Section
│   │           └── Footer
│   │
│   └── Route: /recommendations (Protected)
│       └── PrivateRoute
│           └── Recommendations
│               ├── Header
│               ├── Sidebar
│               ├── Recommendations List
│               ├── Skill Gap Analysis
│               └── Footer
```

---

## Data Flow

```
User Input
    ↓
React Component (State Update)
    ↓
Event Handler
    ↓
Axios API Call
    ↓
Express Backend
    ↓
MongoDB Database
    ↓
Response
    ↓
Update Component State
    ↓
Re-render UI
    ↓
User Sees Update
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                  User Visits App                         │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  App.jsx useEffect:                                      │
│  Check localStorage for token                            │
└──────────────────────────────────────────────────────────┘
                         ↓
                    ┌────┴────┐
                    ↓         ↓
            Token Found   No Token
                    ↓         ↓
        ┌──────────────┐  ┌──────────────┐
        │ isAuth=true  │  │ isAuth=false │
        │ Show         │  │ Show Public  │
        │ Protected    │  │ Routes Only  │
        │ Routes       │  │              │
        └──────────────┘  └──────────────┘
                    ↓         ↓
        ┌──────────────┐  ┌──────────────┐
        │ User can     │  │ User tries   │
        │ access       │  │ to access    │
        │ Dashboard,   │  │ protected    │
        │ Profile,     │  │ route        │
        │ Recommend    │  │              │
        └──────────────┘  └──────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ PrivateRoute        │
                    │ Redirects to /login │
                    └─────────────────────┘
```

---

## File Organization

```
src/
├── index.jsx                    ← React entry point
├── App.jsx                      ← Main app with routing
├── index.css                    ← Global styles
│
├── components/                  ← Reusable components
│   ├── Header.jsx              ← Navigation header
│   ├── Sidebar.jsx             ← Side navigation
│   ├── Footer.jsx              ← Footer section
│   └── PrivateRoute.jsx        ← Route protection
│
└── pages/                       ← Page components
    ├── Home.jsx                ← Landing page
    ├── Login.jsx               ← Login page
    ├── Register.jsx            ← Registration page
    ├── Dashboard.jsx           ← Dashboard page
    ├── Profile.jsx             ← Profile page
    ├── Recommendations.jsx     ← Recommendations page
    └── DashboardModern.jsx     ← Modern dashboard variant
```

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND STACK                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React 18.2.0                                    │   │
│  │  • Component-based UI                            │   │
│  │  • Hooks for state management                    │   │
│  │  • Fast rendering                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Vite 4.3.9                                      │   │
│  │  • Fast build tool                               │   │
│  │  • Hot Module Replacement (HMR)                  │   │
│  │  • Optimized production builds                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tailwind CSS 3.2.4                              │   │
│  │  • Utility-first CSS framework                   │   │
│  │  • Responsive design                             │   │
│  │  • Custom theme configuration                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Router 6.8.0                              │   │
│  │  • Client-side routing                           │   │
│  │  • Protected routes                              │   │
│  │  • Dynamic navigation                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Supporting Libraries                            │   │
│  │  • React Icons - Icon library                    │   │
│  │  • Recharts - Data visualization                 │   │
│  │  • Axios - HTTP client                           │   │
│  │  • PostCSS - CSS processing                      │   │
│  │  • Autoprefixer - Vendor prefixes                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DEVELOPMENT                             │
│  npm run dev → Vite Dev Server (Port 5173)              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  PRODUCTION BUILD                        │
│  npm run build → dist/ folder (optimized)               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              DEPLOYMENT OPTIONS                          │
├─────────────────────────────────────────────────────────┤
│  • Vercel (Recommended)                                 │
│  • Netlify                                              │
│  • GitHub Pages                                         │
│  • AWS S3 + CloudFront                                  │
│  • Any static hosting                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│              OPTIMIZATION STRATEGIES                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Build Optimization:                                    │
│  • Vite tree-shaking                                    │
│  • Code splitting                                       │
│  • Minification                                         │
│  • CSS purging (Tailwind)                               │
│                                                          │
│  Runtime Optimization:                                  │
│  • React.memo for components                            │
│  • useCallback for functions                            │
│  • useMemo for expensive calculations                   │
│  • Lazy loading routes                                  │
│                                                          │
│  Network Optimization:                                  │
│  • API caching                                          │
│  • Compression                                          │
│  • CDN delivery                                         │
│  • Gzip compression                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend Security:                                     │
│  • HTTPS only                                           │
│  • Secure token storage (localStorage)                  │
│  • Input validation                                     │
│  • XSS protection                                       │
│                                                          │
│  Backend Security:                                      │
│  • JWT authentication                                   │
│  • CORS configuration                                   │
│  • Input sanitization                                   │
│  • Rate limiting                                        │
│                                                          │
│  Database Security:                                     │
│  • MongoDB authentication                               │
│  • Encrypted connections                                │
│  • Data validation                                      │
│  • Backup & recovery                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for a scalable, maintainable, and secure web application.
