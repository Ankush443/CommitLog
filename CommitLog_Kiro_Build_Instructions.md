# CommitLog --- Kiro Build Instructions

## 1. Your role and objective

Act as a senior full-stack engineer and pragmatic product designer.
Build **CommitLog**, a polished, small-but-functional MERN application
that helps developers record what they worked on each day and review
their progress over time.

This is a take-home assignment for a software engineering role.
Prioritize **correctness, understandable code, a clean user experience,
sensible architecture, and a reliable README** over unnecessary
complexity. The finished project should also be suitable for future
portfolio and resume use.

**Do not build a huge product.** Deliver a complete MVP with the
features in this document. Work in small steps, inspect the existing
repository before making changes, and explain important decisions. Do
not claim a feature works until it has been implemented and tested.

## 2. Product summary

**Name:** CommitLog\
**Tagline:** *A daily journal for your engineering work.*\
**One-line description:** Record what you shipped, what blocked you, and
what you will do next---then turn those entries into a useful weekly
recap.

### Intended user

A developer working on one or more projects who wants a lightweight
alternative to scattered notes. The application is for personal progress
tracking, not team project management.

### Core user journey

1.  Open the dashboard and see a useful overview of recent activity.
2.  Create a daily log with completed work, blockers, next steps,
    project, and optional repository link.
3.  Find and edit a previous entry.
4.  Browse entries by date and search/filter them.
5.  Review an automatically calculated weekly recap.

## 3. Required technology

Use the MERN stack:

-   **Frontend:** React with Vite, JavaScript or TypeScript (prefer
    TypeScript if it can be implemented consistently), React Router, and
    a lightweight styling approach such as Tailwind CSS or plain CSS
    modules.
-   **Backend:** Node.js and Express.js.
-   **Database:** MongoDB with Mongoose.
-   **API:** REST endpoints returning JSON.
-   **Validation:** Validate all incoming data on the server.
    Client-side validation is a convenience, not a substitute.
-   **Testing:** Add meaningful tests for core backend behavior. Use the
    simplest reliable test setup compatible with the project.
-   **Version control:** Keep code organized and commit in logical
    increments if Git is available.

Use current stable, mutually compatible package versions. Avoid adding
libraries unless they solve a real need. Do not add an AI API, payments,
realtime features, microservices, or complicated infrastructure.

## 4. MVP features

### 4.1 Dashboard

Create a welcoming dashboard with:

-   A clear "New log" action.
-   Number of logs in the current week.
-   Number of distinct projects worked on this week.
-   Recent entries, newest first.
-   A compact seven-day activity view showing which days have logs.
-   A weekly recap preview or a clear link to the recap page.
-   Helpful empty states for a new user with no entries.

Counts and summaries must be derived from saved database records, not
hardcoded demo values. If there is no data, show zero counts and a
helpful prompt.

### 4.2 Daily development logs

Each log should support these fields:

-   `date` --- required calendar date, stored consistently and handled
    without off-by-one timezone bugs.
-   `title` --- required, 3--100 characters.
-   `completed` --- required text describing work completed; allow
    multiple lines, with a sensible maximum length.
-   `blockers` --- optional multiline text.
-   `nextSteps` --- optional multiline text.
-   `projectId` --- optional reference to a project.
-   `repositoryUrl` --- optional valid HTTP/HTTPS GitHub or repository
    URL.
-   `tags` --- optional small list of short tags, if this can be
    implemented cleanly.
-   `createdAt` and `updatedAt` --- generated timestamps.

Required interactions:

-   Create a log.
-   View a log.
-   Edit a log.
-   Delete a log after a confirmation step.
-   Show validation errors clearly.
-   Show loading, success, and failure states.
-   Prevent accidental duplicate submissions while a request is in
    progress.

**Date rule:** A user should be able to save a log for a selected
calendar date and see it on that same date. Use a date-only
representation such as `YYYY-MM-DD` where appropriate, rather than
relying on implicit UTC conversion of local midnight.

Do not silently discard user input when a request fails.

### 4.3 Projects

Users can create, list, edit, and delete projects. Each project has:

-   `name` --- required, 2--60 characters.
-   `description` --- optional, short description.
-   `color` --- optional display color from a fixed safe palette, not
    arbitrary CSS.
-   `createdAt` and `updatedAt`.

A log can be associated with one project. Project deletion must have an
intentional, documented behavior: preferably set associated logs'
`projectId` to null, rather than deleting those logs. Confirm the
behavior in the UI if appropriate.

Prevent duplicate project names in a reasonable, case-insensitive way if
feasible. Keep project management simple.

### 4.4 Search and filters

On the logs page, provide:

-   Text search over title, completed work, blockers, and next steps.
-   Filter by project.
-   Filter by date range or a simple month/date selection.
-   Newest-first sorting.
-   A clear-filters action.
-   A useful no-results state.

Search and filters must operate on real stored data. For the MVP,
server-side search and pagination are preferred if straightforward;
otherwise, fetch a bounded set of records and document the limitation.
Do not load an unbounded collection as the application grows.

### 4.5 Calendar / activity history

Build a lightweight month calendar or a compact date-based activity
view. Dates with logs should be visually distinguishable. Selecting a
date should show that date's entries or navigate to a filtered log view.

Keep the calendar understandable and accessible. Correctly handle month
boundaries and leap years. A simple month grid is enough; do not add a
large calendar dependency unless needed.

### 4.6 Weekly Developer Recap

Build a recap page for a selected week, with the week starting Monday.
Generate it from saved entries---**no AI API is needed**.

Show:

-   Total logs and active days.
-   Projects worked on.
-   Completed-work items summarized from the entries.
-   Blockers mentioned during the week.
-   Next steps / goals for the following week.
-   Previous/next week navigation.

Use transparent aggregation, not claims of AI-generated insight. For
example, combine non-empty completed-work, blocker, and next-step fields
from the selected week, grouped by date or project. Avoid inventing
"recurring blockers" unless the code actually detects repetition; if
repetition detection is implemented, explain the simple rule in the UI
or README.

A recap should still work when the selected week has no entries.

## 5. Scope boundaries

Do **not** implement these unless all required features above are
finished and tested:

-   User registration, login, OAuth, or multi-user permissions.
-   GitHub API integration or automatic commit imports.
-   AI-generated summaries or external LLM calls.
-   Team collaboration, comments, notifications, or realtime updates.
-   Deployment pipelines, Kubernetes, microservices, or complex
    analytics.

For this take-home, keep the app single-user/local by default and make
this limitation explicit in the README. Do not pretend the app has
authentication or production-grade multi-user isolation. If you decide
to add authentication, do it only after the MVP is stable and secure.

## 6. UX and visual direction

Create a professional developer tool, not a generic bootstrap admin
template.

### Design feel

-   Calm, focused, modern, and practical.
-   Light neutral background with a dark text color and one restrained
    accent color.
-   Consistent spacing, typography, borders, and corner radii.
-   Clear hierarchy: page title, contextual summary, primary action,
    then content.
-   Use simple icons only where they improve scanning.
-   Avoid excessive gradients, glassmorphism, oversized hero sections,
    and decorative charts that do not communicate useful data.

### Suggested layout

-   A responsive sidebar or compact top navigation with: Dashboard,
    Logs, Projects, Weekly Recap.
-   Main content area with a readable maximum width.
-   A prominent "New log" button.
-   Log cards or a clean table/list with date, title, project, and a
    short preview.
-   A focused form with clear labels and helpful placeholders.
-   Consistent status messages and confirmation dialogs.

### Responsive and accessible behavior

-   Work well at desktop width and remain usable on mobile.
-   Use semantic headings, labels, buttons, and form controls.
-   Ensure keyboard focus is visible.
-   Do not rely on color alone to communicate state.
-   Add accessible names to icon-only controls.
-   Maintain readable contrast and sensible text sizes.
-   Ensure long text and repository links do not break the layout.

Do not spend time on elaborate animation. Prioritize clear, finished
interactions.

## 7. Suggested architecture

Use a clean, understandable structure similar to:

``` text
commitlog/
  client/
    src/
      components/
      layouts/
      pages/
      hooks/
      lib/
      types/              # if using TypeScript
      App.jsx / App.tsx
      main.jsx / main.tsx
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/            # only where useful
      utils/
      app.js / app.ts
      server.js / server.ts
    tests/
  .env.example
  .gitignore
  README.md
  package.json             # optional root scripts
```

Adjust this structure if a simpler design is more appropriate, but keep
route definitions, controllers, database models, validation, and error
handling separated. Avoid one giant server file or one giant React
component.

### Backend design rules

-   Use Express routers for resources.
-   Use Mongoose models with appropriate schema constraints and
    timestamps.
-   Keep controllers focused on HTTP input/output; put reusable business
    logic in small service/helper functions only when justified.
-   Add centralized error handling and a not-found route.
-   Validate ObjectIds before querying.
-   Return consistent JSON responses and appropriate HTTP status codes.
-   Do not return stack traces or secrets to clients.
-   Use environment variables for configuration.
-   Configure CORS deliberately for the frontend origin.
-   Add basic request body limits and safe handling of malformed JSON.
-   Never commit `.env` or credentials.
-   Add a health endpoint such as `GET /api/health`.

Suggested response shape:

``` json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable message"
}
```

For errors, return a useful message and, where appropriate, field-level
validation details. Do not expose internal stack traces in production
mode.

### Suggested API routes

Implement routes equivalent to the following. You may adapt naming if
the result stays consistent.

**Health** - `GET /api/health`

**Logs** - `GET /api/logs` --- support `search`, `projectId`, `from`,
`to`, `page`, and `limit` as appropriate. - `GET /api/logs/:id` -
`POST /api/logs` - `PATCH /api/logs/:id` - `DELETE /api/logs/:id` -
`GET /api/logs/activity?from=YYYY-MM-DD&to=YYYY-MM-DD` --- return dates
with activity, or provide equivalent data for the calendar. -
`GET /api/logs/recap?weekStart=YYYY-MM-DD` --- return computed weekly
recap data, or compute it in a clearly separated frontend utility if
that is simpler.

**Projects** - `GET /api/projects` - `GET /api/projects/:id` -
`POST /api/projects` - `PATCH /api/projects/:id` -
`DELETE /api/projects/:id`

For list endpoints, return pagination metadata if pagination is
implemented. Use 400 for invalid input, 404 for missing records, 409 for
conflicts such as duplicate project names where applicable, and 500 for
unexpected server errors.

## 8. Data model expectations

### Log model

Use a Mongoose schema with the fields in Section 4.2, suitable indexes,
and timestamps. Consider indexes for `date`, `projectId`, and frequently
searched fields. Do not add indexes without a reason.

### Project model

Use a Mongoose schema with the fields in Section 4.3 and timestamps.
Normalize project names for duplicate detection if needed.

Be deliberate about deleting a project and preserving logs. Do not leave
dangling references.

## 9. Configuration and local setup

Provide a `.env.example` containing placeholders only, for example:

``` dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/commitlog
CLIENT_URL=http://localhost:5173
```

Do not put real passwords, tokens, or production credentials in the
example.

The README must explain both: 1. Local MongoDB setup. 2. How to use a
MongoDB Atlas connection string instead.

If the chosen development environment supports it, provide root scripts
to run client and server together. Otherwise, give clear commands to run
each in separate terminals.

## 10. Error handling and security basics

Implement and verify the following:

-   Server-side input validation and trimming.
-   Correct HTTP status codes.
-   Centralized error handling.
-   Invalid JSON and invalid MongoDB ObjectId handling.
-   Safe URL validation for repository links (`http:` or `https:` only).
-   CORS restricted to the configured frontend origin during
    development.
-   `.env` excluded from Git.
-   No hardcoded secrets.
-   No unsafe rendering of user-provided HTML.
-   Delete confirmation and useful error feedback.
-   Sensible maximum lengths for text fields and request bodies.
-   Do not trust client-supplied timestamps or computed recap totals.
-   Handle a database connection failure with a clear server log and a
    useful health-check result.

Since authentication is out of scope, state that this is a single-user
local/demo application and should not be exposed publicly with private
data without adding authentication and authorization.

## 11. Testing and verification

Write tests for meaningful behavior, not just that the server starts.

At minimum, verify:

-   Creating a valid log succeeds.
-   Missing/invalid required fields are rejected.
-   Reading a nonexistent log returns 404.
-   Updating a log works and rejects invalid data.
-   Deleting a log works.
-   Creating a project works and duplicate handling is consistent.
-   Deleting a project preserves associated logs according to the chosen
    rule.
-   Weekly recap calculations handle empty weeks and aggregate
    dates/projects correctly.
-   Search and project/date filters return expected results.
-   Date handling does not move an entry to the previous or next day
    unexpectedly.

If database-backed integration tests are used, document the test
database configuration and ensure tests do not erase real data. Prefer a
dedicated test database or an isolated in-memory MongoDB setup if
reliable in the environment.

Also perform a manual UI smoke test:

-   First-time empty dashboard.
-   Create project and log.
-   Edit and delete a log.
-   Search and filter logs.
-   Navigate calendar dates.
-   View recap for a week with data and a week without data.
-   Refresh a page and confirm saved records persist.
-   Check the browser console and server logs for errors.

Do not claim tests passed unless you actually ran them. If a test cannot
be run due to an environment limitation, state that clearly.

## 12. Implementation plan --- follow in order

Work in these milestones and keep the application runnable after each
one.

### Milestone 1: Inspect and plan

-   Inspect the workspace and existing files before creating or
    overwriting anything.
-   Confirm whether the repo is empty and identify the package manager.
-   Create a short implementation checklist.
-   Choose JavaScript or TypeScript and keep the choice consistent.
-   Explain the planned folder structure and main dependencies before
    making large changes.

### Milestone 2: Backend foundation

-   Set up Express, configuration, MongoDB connection, health endpoint,
    centralized errors, and environment example.
-   Confirm the server starts and the health endpoint responds.
-   Add Mongoose Project and Log models.

### Milestone 3: CRUD APIs

-   Implement and test project and log CRUD.
-   Add validation, search/filtering, project deletion behavior, and
    useful error responses.
-   Test with API requests before building the UI.

### Milestone 4: Frontend foundation

-   Set up React, routing, shared layout/navigation, API client,
    reusable form fields, loading/error/empty states.
-   Establish design tokens and responsive layout.

### Milestone 5: Main features

-   Build Dashboard, Logs list/search/filter, Create/Edit/View Log, and
    Projects pages.
-   Connect each feature to the real API and database. Do not use fake
    data as the final source of truth.

### Milestone 6: Calendar and recap

-   Build activity calendar/date navigation.
-   Implement weekly recap calculations and week navigation.
-   Test empty, partial, and populated data states.

### Milestone 7: Quality pass

-   Run backend tests, frontend build, and lint/type checks if
    configured.
-   Fix all known critical bugs and console errors.
-   Test invalid inputs, database failures, date boundaries, and
    responsive behavior.
-   Remove unused dependencies, dead code, placeholder buttons, and
    debug logs.
-   Verify that all visible actions do something meaningful.

### Milestone 8: Documentation and final review

-   Write the README using Section 13.
-   Verify a clean setup from the documented instructions.
-   Check `.gitignore`, `.env.example`, repository structure, and commit
    history.
-   Provide a final summary of implemented features, commands run, test
    results, known limitations, and files that need user configuration.

**Important:** Do not attempt to generate the entire app in one enormous
change. Implement one milestone at a time, inspect the result, run it,
fix errors, and then continue.

## 13. README requirements

Write a useful `README.md` containing:

1.  **Project name and description** --- CommitLog and the problem it
    solves.
2.  **Features** --- only features that are actually implemented.
3.  **Tech stack** --- React, Node.js, Express, MongoDB, Mongoose, and
    other real dependencies.
4.  **Architecture** --- brief request/data flow and folder overview.
5.  **Prerequisites** --- supported Node.js version, npm, MongoDB local
    or Atlas.
6.  **Environment setup** --- copy `.env.example` to `.env` and
    configure MongoDB.
7.  **Installation and run instructions** --- exact commands for
    server/client and any root-level shortcuts.
8.  **Testing** --- exact test and build commands, plus verified
    results.
9.  **AI development tool** --- explicitly state that **Kiro** was used.
10. **AI Development Experience** --- a short, honest account of how
    Kiro helped and what you reviewed or corrected yourself.
11. **3--5 specific AI-assisted tasks** --- choose from actual work
    completed, such as:
    -   Planning the folder structure and API contracts.
    -   Scaffolding React components or forms.
    -   Implementing Express CRUD routes and Mongoose integration.
    -   Debugging validation, date handling, or database errors.
    -   Generating tests and then reviewing/running them.
    -   Refactoring repeated UI/API logic.
12. **Design decisions and limitations** --- including no authentication
    and no external AI API.
13. **Screenshots** --- add screenshots only after capturing the real
    working app; do not fabricate screenshots.
14. **Future improvements** --- a short list, clearly separated from
    completed features.

**Do not invent AI usage, test results, performance metrics, or
features.** Keep a small development note as you work so the final AI
experience section accurately reflects the tasks where Kiro was used and
the changes you personally inspected.

## 14. GitHub and code quality

Before submission:

-   Ensure the repository is public only when the user is ready to
    publish it.
-   Check for `.env`, credentials, tokens, private data, and local
    database files before pushing.
-   Add a useful `.gitignore` for Node, Vite, environment files, logs,
    coverage, and build output.
-   Use descriptive filenames and consistent formatting.
-   Prefer small, meaningful functions and reusable components.
-   Avoid duplicated validation logic where practical.
-   Keep comments for non-obvious decisions, not for every line.
-   Use descriptive commit messages, for example:
    -   `chore: scaffold MERN application`
    -   `feat: add log and project APIs`
    -   `feat: build daily log workflow`
    -   `feat: add weekly recap and activity calendar`
    -   `test: cover log validation and recap calculations`
    -   `docs: add setup and Kiro development notes`

Do not claim a commit was created or a repository was published unless
that action actually happened. Do not push code without the user's
explicit direction.

## 15. Acceptance checklist

The MVP is ready only when all applicable items below are true:

-   [ ] Frontend and backend start using documented commands.
-   [ ] MongoDB persistence works across page refreshes.
-   [ ] Users can create, read, edit, and delete logs.
-   [ ] Users can create and manage projects.
-   [ ] Logs can be associated with projects.
-   [ ] Search and filters return correct results.
-   [ ] Calendar/activity view reflects saved logs.
-   [ ] Weekly recap is computed from saved records and handles empty
    weeks.
-   [ ] Loading, error, success, and empty states are present.
-   [ ] Forms validate data on both client and server.
-   [ ] No major console errors, broken navigation, or placeholder
    buttons remain.
-   [ ] Tests and frontend build have been run, with results recorded
    honestly.
-   [ ] README setup steps are accurate.
-   [ ] README names Kiro and documents 3--5 real AI-assisted tasks.
-   [ ] No secrets or `.env` files are committed.
-   [ ] The code is understandable enough for the developer to explain
    in an interview.

## 16. Interview-readiness requirement

As you implement, keep brief notes explaining:

-   Why the models and API routes are structured this way.
-   How frontend state and API requests work.
-   How validation and errors flow from Express to React.
-   How weekly recap totals are calculated.
-   How project deletion preserves logs.
-   What Kiro generated, what you changed, and why.
-   Which trade-offs were made to keep the MVP small.

At the end, give the developer a concise walkthrough of the architecture
and the most important files, plus likely interview questions based on
the actual implementation. Do not hide complexity behind AI-generated
code the developer cannot explain.

## Final instruction to Kiro

Start with **Milestone 1 only**. Inspect the workspace, propose the
implementation checklist and folder structure, and identify any
decisions that genuinely require my input. Use sensible defaults for the
rest. Then implement one milestone at a time, testing as you go. The
goal is a polished, reliable, understandable MVP---not the largest
possible feature list.
