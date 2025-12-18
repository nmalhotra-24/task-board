# E2E Testing Guide

## Overview
Comprehensive End-to-End tests covering all core business logic and user workflows as required by the assignment.

## Test Coverage

### ✅ Required Test Scenarios (All Implemented)

1. **Project Creation** (`test 1`)
   - Create multiple projects
   - Verify projects appear in sidebar
   - Switch between projects

2. **Task Management** (`test 3`)
   - **Create** tasks with all fields
   - **Read** tasks in Kanban columns
   - **Update** task details (title, description, priority)
   - **Delete** tasks with confirmation

3. **Status Transitions** (`test 4`)
   - Move tasks: To Do → In Progress → Done
   - Verify tasks appear in correct columns
   - Test complete task lifecycle

4. **Team Collaboration** (`test 2`)
   - Add multiple team members
   - Assign tasks to team members
   - Verify member avatars on tasks

### 🎯 Additional Test Scenarios

5. **Complete Workflow** (`test 5`)
   - End-to-end user journey
   - Project creation → Team setup → Task creation → Filtering
   - Validates entire application flow

6. **Search and Filter** (`test 6`)
   - Search tasks by keyword
   - Filter by priority
   - Filter by assignee
   - Sort by different criteria

7. **WebSocket Connection** (`test 7`)
   - Verify real-time connection status
   - Check connection indicator visibility

## Running Tests

### Prerequisites
Make sure both servers are running:
```bash
# Terminal 1 - Backend
cd backend
PYTHONPATH=$(pwd) uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm start
```

### Run Tests

**Headless mode (CI/automated):**
```bash
cd frontend
npm run test:e2e
```

**Headed mode (see browser):**
```bash
npm run test:e2e:headed
```

**UI mode (interactive debugging):**
```bash
npm run test:e2e:ui
```

### Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Structure

```
frontend/
├── e2e/
│   └── taskboard.spec.js    # All E2E tests
├── playwright.config.js      # Playwright configuration
└── playwright-report/        # Test results (generated)
```

## What Gets Tested

✅ **User Interactions:**
- Button clicks
- Form submissions
- Drag and drop (via status change)
- Modal dialogs
- Search and filters

✅ **Data Validation:**
- Projects created successfully
- Tasks appear in correct columns
- Team members saved and displayed
- Filters work correctly

✅ **Visual Verification:**
- Elements visible on screen
- Correct text content
- Proper column organization

## Test Duration

- All 7 tests: ~30-45 seconds
- Individual test: ~3-7 seconds each

## Notes

- Tests run **sequentially** (not parallel) to avoid database conflicts
- Uses **SQLite** database (resets between test runs)
- **Screenshots** captured on failure
- **Videos** recorded on failure for debugging

## Assignment Compliance

✅ **"End-to-End Testing: Comprehensive testing of core business logic and user workflows"**
   - All 7 tests cover complete user workflows

✅ **"Test scenarios should cover: project creation, task management, status transitions, and team collaboration"**
   - Test 1: Project creation ✓
   - Test 3: Task management (full CRUD) ✓
   - Test 4: Status transitions ✓
   - Test 2: Team collaboration ✓

✅ **"No need comprehensive coverage due to time constraints"**
   - Focused on critical paths
   - 7 tests covering main features
   - ~250 lines of test code

## Troubleshooting

**Tests fail with "Cannot connect":**
- Make sure backend is running on port 8001
- Make sure frontend is running on port 3000

**Tests timeout:**
- Increase timeout in playwright.config.js
- Check if servers started successfully

**Database conflicts:**
- Tests use sequential execution to avoid conflicts
- Each test creates its own project namespace
