# Running Tests

## Prerequisites

The full test suite requires MongoDB to be running. The tests use a separate test database (`commitlog-test`) to avoid affecting development data.

## Setup MongoDB for Testing

### Option 1: Local MongoDB

```bash
# Start MongoDB (if not already running)
sudo systemctl start mongod

# Or on macOS with Homebrew:
brew services start mongodb-community
```

### Option 2: Custom MongoDB URI

Set the test database URI:

```bash
export TEST_MONGODB_URI="mongodb://127.0.0.1:27017/commitlog-test"
```

Or for MongoDB Atlas:

```bash
export TEST_MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/commitlog-test"
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/health.test.ts

# Run tests in watch mode
npm run test:watch
```

## Test Suites

### Health Tests (No MongoDB Required)
- `tests/health.test.ts` - API health check and 404 handling
- **Status:** ✓ Passing

### Project API Tests (Requires MongoDB)
- `tests/project.test.ts` - Full CRUD operations for projects
- Tests duplicate name detection
- Verifies project deletion preserves logs
- **Status:** Ready (needs MongoDB)

### Log API Tests (Requires MongoDB)
- `tests/log.test.ts` - Full CRUD operations for logs
- Tests validation rules
- Tests search, filtering, and pagination
- Tests activity data aggregation
- **Status:** Ready (needs MongoDB)

### Weekly Recap Tests (Requires MongoDB)
- `tests/recap.test.ts` - Weekly recap calculations
- Tests date helpers (Monday/Sunday calculations)
- Tests metric aggregation
- Tests empty week handling
- **Status:** Ready (needs MongoDB)

## Test Coverage

The test suite covers:

✅ **CRUD Operations**
- Creating, reading, updating, and deleting projects
- Creating, reading, updating, and deleting logs
- Input validation for all fields
- Error handling for invalid data

✅ **Business Logic**
- Case-insensitive duplicate project name detection
- Project deletion sets log.projectId to null (preserves logs)
- Date format validation (YYYY-MM-DD)
- Repository URL validation (http/https only)
- Tag limits and validation

✅ **Search & Filtering**
- Text search across log fields
- Filter by project
- Filter by date range
- Pagination with metadata

✅ **Weekly Recap**
- Week start/end calculation (Monday-Sunday)
- Total logs and active days count
- Project aggregation with counts
- Completed work, blockers, and next steps collection
- Empty field filtering
- Current week default

✅ **Edge Cases**
- Non-existent resource (404)
- Invalid ObjectId format (400)
- Missing required fields (400)
- Duplicate entries (409)
- Empty database states

## Verification Without MongoDB

If MongoDB is not available, you can still verify:

```bash
# TypeScript compilation
npm run build

# Health check tests (no database needed)
npm test -- tests/health.test.ts
```

Both should pass without MongoDB running.

## Expected Output

When all tests pass with MongoDB:

```
✓ tests/health.test.ts  (2 tests)
✓ tests/project.test.ts  (11 tests)
✓ tests/log.test.ts  (19 tests)
✓ tests/recap.test.ts  (10 tests)

Test Files  4 passed (4)
     Tests  42 passed (42)
```

## Note on Test Database

Tests automatically use the `commitlog-test` database, separate from the development `commitlog` database. The test database is cleaned before each test to ensure isolation.
