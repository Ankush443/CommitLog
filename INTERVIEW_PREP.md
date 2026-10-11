# Interview Preparation Guide - CommitLog

## Project Overview

**CommitLog** is a full-stack MERN application for tracking daily development work. Built with TypeScript, it demonstrates modern web development practices, RESTful API design, and responsive UI development.

## Quick Stats

- **Total Lines of Code:** ~5,000+ lines
- **Backend Files:** 13 TypeScript files + 4 test files
- **Frontend Files:** 25 TypeScript/TSX files
- **Components:** 7 reusable UI components
- **API Endpoints:** 13 REST endpoints
- **Build Size:** 277KB JS (88KB gzipped), 16KB CSS (3.7KB gzipped)
- **Test Coverage:** 42 tests written (2 passing without DB, 40 require MongoDB)

## Architecture Deep Dive

### Backend Architecture

**Pattern:** MVC (Model-View-Controller) with Express.js

**Flow:**
```
HTTP Request → Routes → Middleware (Validation) → Controller → Model → MongoDB
                                                       ↓
HTTP Response ← Error Handler ← Controller ← Model Query Result
```

**Key Components:**

1. **Models (Mongoose Schemas):**
   - `Log`: Stores daily development entries with validation
   - `Project`: Organizes logs with color-coded categories
   - Includes indexes for efficient querying (date, projectId, text search)

2. **Controllers:**
   - Thin layer handling HTTP request/response
   - Business logic delegated to models and utility functions
   - Consistent error handling with try-catch

3. **Middleware:**
   - `errorHandler.ts`: Centralized error handling with appropriate status codes
   - `validation.ts`: express-validator integration for request validation
   - CORS configuration for cross-origin requests

4. **Routes:**
   - RESTful conventions (GET, POST, PATCH, DELETE)
   - Parameter validation before controller execution
   - Organized by resource (logs, projects)

### Frontend Architecture

**Pattern:** Component-based architecture with React Router

**Structure:**
```
App (Router)
  ├── Layout (Sidebar + Main)
  │     ├── Navigation
  │     └── Pages
  │           ├── Dashboard
  │           ├── LogsPage
  │           ├── LogFormPage
  │           ├── ProjectsPage
  │           ├── CalendarPage
  │           └── RecapPage
  └── Services (API integration layer)
```

**Key Patterns:**

1. **Component Composition:**
   - Common components (Button, Card, Input, etc.)
   - Page-level components for routes
   - Layout components for structure

2. **State Management:**
   - Local component state with `useState`
   - Side effects with `useEffect`
   - No global state needed (small application scope)

3. **API Integration:**
   - Axios client with interceptors
   - Service layer abstracts API calls
   - Type-safe responses with TypeScript

4. **Routing:**
   - React Router v6 with nested routes
   - Layout wrapper for consistent navigation
   - Dynamic routes for edit pages

## Technical Decisions & Rationale

### 1. Date Handling: YYYY-MM-DD Strings

**Decision:** Store dates as strings instead of JavaScript Date objects

**Rationale:**
- Avoids timezone conversion bugs
- Consistent representation across client and server
- Simpler to query and compare in MongoDB
- User sees the exact date they entered

**Implementation:**
```typescript
// Bad: Date object (timezone issues)
const log = { date: new Date('2024-01-15') }; // May become Jan 14 or 16

// Good: String format (timezone-safe)
const log = { date: '2024-01-15' }; // Always Jan 15
```

### 2. Project Deletion: Preserve Logs

**Decision:** Set `projectId` to `null` instead of cascading delete

**Rationale:**
- Preserves historical data
- User may want to reorganize projects later
- Clear UI feedback showing affected log count

**Implementation:**
```typescript
await Log.updateMany(
  { projectId: req.params.id },
  { $set: { projectId: null } }
);
```

### 3. Weekly Recap: Server-Side Aggregation

**Decision:** Calculate recap on backend, not client

**Rationale:**
- Consistent business logic
- Reduces client-side complexity
- Can leverage MongoDB aggregation features
- Single source of truth

**Implementation:**
```typescript
// MongoDB aggregation for unique dates
const uniqueDates = new Set(logs.map(log => log.date));
const activeDays = uniqueDates.size;
```

### 4. TypeScript Throughout

**Decision:** Use TypeScript on both frontend and backend

**Rationale:**
- Catches errors at compile time
- Better IDE support and autocomplete
- Improved maintainability
- Type safety for API contracts

### 5. MongoDB Over SQL

**Decision:** Document database instead of relational

**Rationale:**
- Flexible schema for optional fields
- Natural JSON representation
- Embedded references for projects
- Good fit for development logs (unstructured data)

## Common Interview Questions & Answers

### "Walk me through the request flow for creating a log"

1. User fills form in `LogFormPage.tsx`
2. Form submission calls `logService.create()`
3. Axios sends POST request to `/api/logs`
4. Express router matches route in `logRoutes.ts`
5. Validation middleware checks input with express-validator
6. Controller `createLog` receives validated data
7. Mongoose model creates document with validation
8. Response returns created log with 201 status
9. Client receives response, redirects to logs page

### "How did you handle validation?"

**Two-layer approach:**

1. **Client-side:** Immediate feedback, better UX
   - HTML5 attributes (required, minLength, pattern)
   - React controlled inputs with error states

2. **Server-side:** Security, data integrity (never trust client)
   - express-validator on routes
   - Mongoose schema validation
   - Custom validators for complex rules

**Example:**
```typescript
// Route validation
body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 3, max: 100 })

// Model validation
title: {
  type: String,
  required: [true, 'Title is required'],
  trim: true,
  minlength: [3, 'Title must be at least 3 characters'],
  maxlength: [100, 'Title cannot exceed 100 characters'],
}
```

### "How does the search functionality work?"

**Multi-field text search with filters:**

1. Text search uses MongoDB regex for case-insensitive matching
2. Searches across title, completed, blockers, nextSteps
3. Combined with optional filters (project, date range)
4. Paginated results (50 per page)

**Implementation:**
```typescript
if (search) {
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { completed: { $regex: search, $options: 'i' } },
    // ... other fields
  ];
}
```

### "What about error handling?"

**Centralized approach:**

1. Controllers use try-catch blocks
2. Errors passed to centralized error handler
3. Different status codes for different error types:
   - 400: Validation errors
   - 404: Not found
   - 409: Conflicts (duplicates)
   - 500: Server errors

4. Production mode hides stack traces
5. Field-level validation errors sent to client

### "How did you ensure the app is secure?"

**Security measures:**

1. **Environment Variables:** Secrets in .env (not committed)
2. **Input Validation:** All inputs validated on server
3. **CORS:** Configured for specific origin
4. **NoSQL Injection:** Mongoose sanitizes queries
5. **Request Limits:** Body size limits configured
6. **URL Validation:** Only HTTP/HTTPS allowed
7. **ObjectId Validation:** Before database queries

### "How would you add authentication?"

**Approach for multi-user:**

1. **Add User model** with hashed passwords (bcrypt)
2. **JWT tokens** for stateless auth
3. **Middleware** to verify tokens on protected routes
4. **Associate data** with userId (add to Log/Project models)
5. **Filter queries** to only show user's data

**Example:**
```typescript
// Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, SECRET);
  req.userId = decoded.id;
  next();
};

// Controller
const logs = await Log.find({ userId: req.userId });
```

### "What challenges did you face?"

1. **Date Timezone Issues:**
   - Problem: Dates shifting by one day
   - Solution: Store as YYYY-MM-DD strings, not Date objects

2. **Project Deletion:**
   - Problem: Should logs be deleted too?
   - Solution: Set projectId to null, show affected count

3. **Weekly Recap:**
   - Problem: Week calculation (Monday-Sunday)
   - Solution: date-fns library with proper week start configuration

4. **Pagination:**
   - Problem: Performance with large datasets
   - Solution: Server-side pagination with limit/offset

## Code You Should Know Well

### Key Backend Files

1. **server/src/models/Log.ts** - Schema and validation
2. **server/src/controllers/logController.ts** - CRUD operations
3. **server/src/utils/recapCalculator.ts** - Week aggregation logic
4. **server/src/middleware/errorHandler.ts** - Error handling

### Key Frontend Files

1. **client/src/pages/LogFormPage.tsx** - Complex form with validation
2. **client/src/pages/LogsPage.tsx** - Search, filtering, pagination
3. **client/src/services/logService.ts** - API integration
4. **client/src/lib/dateUtils.ts** - Date manipulation

## Kiro AI Integration

### What Kiro Did

1. **Scaffolding:** Generated folder structure, configs, and boilerplate
2. **Implementation:** Wrote models, controllers, components with proper patterns
3. **Testing:** Created comprehensive test suites
4. **Documentation:** Generated README and inline comments

### What I Reviewed

1. **Architecture Decisions:** Verified folder structure and patterns
2. **Business Logic:** Confirmed date handling and deletion behavior
3. **Validation:** Ensured proper constraints and error messages
4. **Edge Cases:** Tested empty states and boundary conditions
5. **Security:** Verified no secrets committed, proper validation

### Key Takeaway

Kiro accelerated development significantly while maintaining code quality. I maintained oversight of critical decisions and verified all implementations. The result is production-ready code I can fully explain and defend.

## Demo Talking Points

1. **Show the calendar** - Explain activity color coding and date calculations
2. **Create a log** - Demonstrate validation and error handling
3. **Weekly recap** - Explain server-side aggregation and week logic
4. **Search functionality** - Show multi-field search and filters
5. **Project deletion** - Demonstrate preserved logs with confirmation

## Final Thoughts

This project demonstrates:
- Full-stack MERN development with TypeScript
- RESTful API design and implementation
- Modern React patterns and hooks
- Database modeling and querying
- Error handling and validation
- Clean code and maintainability
- AI-assisted development workflow

**Total Development Time:** Built in structured milestones with AI assistance
**Code Quality:** Production-ready with comprehensive validation and error handling
**Scalability:** Foundation ready for authentication and multi-user support
