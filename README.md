# CommitLog

**A daily journal for your engineering work.**

CommitLog is a lightweight MERN application that helps developers track their daily progress, manage projects, and review their work through weekly recaps and activity calendars. Record what you shipped, what blocked you, and what comes next—all in one place.

## Features

- **Daily Logs** — Create, edit, and delete logs with date, title, completed work, blockers, next steps, project tag, repository URL, and up to 10 tags
- **Projects** — Organize logs by color-coded projects; deleting a project preserves its logs
- **Search & Filter** — Full-text search, project filter, date-range filter, and pagination
- **Activity Calendar** — GitHub-style year heatmap plus a 90-day mini calendar on the dashboard
- **Weekly Recap** — Automatic Monday–Sunday summary with stats, projects, completed work, and blockers
- **Theme Switcher** — Light, Dark, and Matrix themes from the sidebar

## Screenshots

| Dashboard | Logs |
|:-:|:-:|
| <img src="screenshots/dashboard.png" width="340" alt="Dashboard"> | <img src="screenshots/logs-list.png" width="340" alt="Logs"> |

| Log Form | Projects |
|:-:|:-:|
| <img src="screenshots/log-form.png" width="340" alt="Log Form"> | <img src="screenshots/projects.png" width="340" alt="Projects"> |

| Calendar | Weekly Recap |
|:-:|:-:|
| <img src="screenshots/calendar.png" width="340" alt="Calendar"> | <img src="screenshots/weekly-recap.png" width="340" alt="Weekly Recap"> |

## Themes

CommitLog ships with a theme switcher in the sidebar — pick a look and it stays saved in your browser.

| Light | Dark | Matrix |
|:-:|:-:|:-:|
| Clean, high-contrast light UI | Low-glare dark UI | Green-on-black hacker aesthetic |

## Tech Stack

### Backend
- **Node.js** (v25.2.0) - JavaScript runtime
- **Express.js** (v4.18.2) - Web framework
- **MongoDB** with **Mongoose** (v8.0.0) - Database and ODM
- **TypeScript** (v5.3.3) - Type safety
- **express-validator** (v7.0.1) - Request validation
- **dotenv** (v16.3.1) - Environment configuration
- **cors** (v2.8.5) - Cross-origin resource sharing

### Frontend
- **React** (v18.2.0) - UI library
- **React Router** (v6.20.0) - Client-side routing
- **Vite** (v5.0.8) - Build tool and dev server
- **TypeScript** (v5.3.3) - Type safety
- **Tailwind CSS** (v3.3.6) - Utility-first styling
- **Axios** (v1.6.2) - HTTP client
- **date-fns** (v3.0.0) - Date manipulation

### Testing
- **Vitest** (v1.0.4) - Test framework
- **Supertest** (v6.3.3) - HTTP testing

## Architecture

### Request Flow
```
Client (React) → Axios → Express API → Mongoose → MongoDB
                    ↓
              Validation → Controllers → Models
```

### Project Structure
```
commitlog/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── layouts/     # Layout components with navigation
│   │   ├── pages/       # Route-level page components
│   │   ├── services/    # API service functions
│   │   ├── lib/         # Utilities (API client, date helpers)
│   │   ├── types/       # TypeScript type definitions
│   │   └── App.tsx      # Main app with routing
│   └── dist/            # Production build output
│
├── server/              # Express backend
│   ├── src/
│   │   ├── config/      # Database connection
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Validation and error handling
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API route definitions
│   │   ├── utils/       # Helpers (recap calculator)
│   │   └── server.ts    # Entry point
│   ├── tests/           # Test suites
│   └── dist/            # Compiled JavaScript
│
├── .env.example         # Environment template
└── README.md            # This file
```

### API Endpoints

**Health**
- `GET /api/health` - Server health check

**Projects**
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Logs**
- `GET /api/logs` - List logs (with search, filters, pagination)
- `GET /api/logs/:id` - Get single log
- `POST /api/logs` - Create log
- `PATCH /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log
- `GET /api/logs/activity` - Activity calendar data
- `GET /api/logs/recap` - Weekly recap aggregation

## Prerequisites

- **Node.js** v20+ (tested with v25.2.0)
- **npm** v9+ (tested with v11.19.1)
- **MongoDB** v7.0+ (local installation or MongoDB Atlas)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CommitLog
```

### 2. Environment Setup

Create environment configuration:
```bash
cp .env.example server/.env
```

Edit `server/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/commitlog
CLIENT_URL=http://localhost:5173
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/commitlog
```

### 3. Install Dependencies

Install all dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. MongoDB Setup

**Option A: Local MongoDB**

See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed installation instructions.

Quick start for Ubuntu/Debian:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option B: MongoDB Atlas**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

## Running the Application

### Development Mode

**Run servers in separate terminals:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

**Or use the npm scripts from root:**

Terminal 1:
```bash
npm run dev:server
```

Terminal 2:
```bash
npm run dev:client
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### Production Build

Build both frontend and backend:
```bash
# Backend
cd server && npm run build

# Frontend
cd client && npm run build
```

Run production server:
```bash
cd server && npm start
```

Serve frontend build (use a static file server like `serve`):
```bash
npx serve -s client/dist
```

## Testing

### Backend Tests

Run all tests:
```bash
cd server
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run specific test file:
```bash
npm test -- tests/health.test.ts
```

**Test Results:**
- ✅ 2/2 health check tests passing
- 📝 40 additional tests require MongoDB connection

See [server/TESTING.md](server/TESTING.md) for detailed testing documentation.

### Manual Testing

1. Start the application
2. Navigate to http://localhost:5173
3. Test the following flows:
   - Create a project
   - Create a log with the project
   - Search and filter logs
   - View activity calendar
   - Check weekly recap
   - Edit and delete items

## AI Development with Kiro

**This project was built using Kiro**, an AI-powered development assistant that helped accelerate development while maintaining code quality and best practices.

### Development Experience

Kiro was instrumental in building CommitLog from concept to production-ready application. The AI assistant helped with architecture decisions, implementation, and verification while I maintained oversight of all critical decisions and code quality.

**What Worked Well:**
- **Rapid scaffolding:** Kiro quickly set up the MERN stack with TypeScript, proper folder structure, and configuration files
- **Consistent patterns:** The AI maintained consistent coding patterns across frontend and backend
- **Type safety:** TypeScript integration was handled comprehensively with proper interfaces throughout
- **Error handling:** Centralized error handling and validation were implemented correctly from the start
- **Documentation:** Inline comments and documentation were generated alongside code

**What Required Review:**
- **Date handling logic:** I verified the YYYY-MM-DD string approach to avoid timezone bugs
- **Project deletion behavior:** Confirmed that deleting projects preserves logs (sets projectId to null)
- **Validation rules:** Double-checked field length limits and format requirements
- **Edge cases:** Ensured empty states and error conditions were properly handled

### Specific AI-Assisted Tasks

1. **Architecture Planning**
   - Kiro proposed the folder structure and separation of concerns
   - Suggested appropriate dependencies for the MERN stack
   - Designed the API contract with RESTful conventions

2. **Backend Implementation**
   - Scaffolded Express server with TypeScript configuration
   - Created Mongoose models with validation and indexes
   - Implemented CRUD controllers with error handling
   - Built weekly recap aggregation logic
   - Wrote comprehensive test suites (42 tests total)

3. **Frontend Development**
   - Set up React with Vite and Tailwind CSS
   - Created reusable component library (Button, Card, Input, etc.)
   - Implemented all pages with proper form validation
   - Built responsive layout with navigation
   - Integrated API services with proper error handling

4. **Date Handling**
   - Implemented YYYY-MM-DD string storage strategy
   - Created date utility functions using date-fns
   - Built week calculation logic (Monday-Sunday)
   - Handled month navigation for calendar

5. **Quality Assurance**
   - Ran TypeScript compilation checks
   - Verified no unused code or dependencies
   - Checked for security issues (env files, validation)
   - Created comprehensive quality checklist
   - Documented all edge cases and limitations

## Design Decisions

### Why YYYY-MM-DD String for Dates?
Storing dates as strings (`YYYY-MM-DD`) instead of JavaScript Date objects avoids timezone conversion bugs. A log created on "2024-01-15" stays "2024-01-15" regardless of server timezone.

### Why Preserve Logs When Deleting Projects?
When a project is deleted, associated logs remain with `projectId` set to `null`. This preserves historical work while removing the organizational structure. The UI shows a confirmation with the affected log count.

### Why MongoDB Over SQL?
MongoDB's flexible schema works well for development logs where optional fields (blockers, nextSteps) may not always be present. The document model naturally represents logs with embedded project references.

### Why No Authentication?
This MVP is designed as a local, single-user tool for personal productivity. Authentication would be the first addition for multi-user or hosted deployment.

### Why Server-Side Recap Calculation?
Weekly recap aggregation happens on the backend to ensure consistent business logic and reduce client-side complexity. The recap endpoint performs MongoDB aggregations for accurate statistics.

## Limitations

- **Single-user application:** No authentication or multi-user support
- **Not production-ready for shared hosting:** Designed for local/personal use
- **Manual MongoDB setup required:** Database not bundled with application
- **No real-time updates:** Changes require page refresh (by design)
- **No file uploads:** Text-only log entries
- **Pagination limit:** Loads up to 50 logs per page
- **Browser-based only:** No mobile native app

## Future Improvements

Potential enhancements beyond the MVP:

- [ ] User authentication with JWT
- [ ] Multi-user support with data isolation
- [ ] Export logs to Markdown or PDF
- [ ] GitHub API integration for commit history
- [ ] Customizable weekly recap templates
- [ ] Keyboard shortcuts
- [ ] Log templates for common tasks
- [ ] Bulk operations (delete, tag)
- [ ] Search result highlighting
- [ ] Real-time collaboration features
- [ ] Mobile responsive optimizations
- [ ] Progressive Web App (PWA) support

## License

MIT

## Contributing

This is a portfolio project demonstrating MERN stack development with AI assistance. Contributions are welcome for learning purposes.

## Acknowledgments

- **Kiro AI** - AI-powered development assistant
- **Spec Document** - CommitLog_Kiro_Build_Instructions.md provided clear requirements
- **MERN Stack Community** - For excellent documentation and examples

---

**Built with Kiro in 2024** | [Report Issues](../../issues)
