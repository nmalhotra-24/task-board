# Task Board Backend

FastAPI backend server with WebSocket support for real-time collaborative task management.

## Setup

### Prerequisites
- Python 3.8-3.12 (tested with 3.13, may require updated dependencies)
- SQLite (included) or PostgreSQL 13+ (optional for production)

### Installation

1. Navigate to the backend directory:
```bash
cd task-board/backend
```

2. Create a virtual environment (optional but recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note**: If using Python 3.13+, you may need to upgrade dependencies:
```bash
pip install --upgrade fastapi pydantic sqlalchemy uvicorn
```

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

The server will start at `http://localhost:8000`

**Database**: Uses SQLite by default (`taskboard.db` created automatically). No database setup required!

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/projects/{project_id}/tasks` - List tasks with filtering
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Query Parameters for filtering:**
- `status` - Filter by status (to_do, in_progress, done)
- `priority` - Filter by priority (low, medium, high)
- `assigned_to` - Filter by team member ID
- `search` - Search in title/description
- `sort_by` - Sort by field (created_at, due_date, priority)
- `order` - Sort order (asc, desc)

### Team Members
- `GET /api/team-members` - List team members
- `POST /api/team-members` - Create team member
- `GET /api/team-members/{id}` - Get team member
- `PUT /api/team-members/{id}` - Update team member
- `DELETE /api/team-members/{id}` - Delete team member

### WebSocket
- `WS /ws/{client_id}` - WebSocket connection for real-time updates

## Running Tests

```bash
pytest
```

For verbose output:
```bash
pytest -v
```

For coverage:
```bash
pytest --cov=app --cov-report=html
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models/              # SQLAlchemy models
│   │   ├── project.py
│   │   ├── task.py
│   │   └── team_member.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── project.py
│   │   ├── task.py
│   │   └── team_member.py
│   ├── routes/              # API endpoints
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   └── team_members.py
│   └── websocket/           # WebSocket manager
│       └── manager.py
├── tests/                   # Test files
│   └── test_projects.py
├── requirements.txt
├── .env.example
└── .gitignore
```

## Database Schema

### Entity Relationship Diagram
```
┌──────────────────┐
│    PROJECTS      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │ 1
         │
         │ Many
         ▼
┌──────────────────┐            ┌──────────────────┐
│     TASKS        │   Many     │  TEAM_MEMBERS    │
├──────────────────┤ ◄────────  ├──────────────────┤
│ id (PK)          │      1     │ id (PK)          │
│ project_id (FK)  │            │ name             │
│ title            │            │ email            │
│ description      │            │ avatar_url       │
│ status           │            │ created_at       │
│ priority         │            └──────────────────┘
│ assigned_to (FK) │
│ due_date         │
│ position         │
│ created_at       │
│ updated_at       │
└──────────────────┘
```

### Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('to_do', 'in_progress', 'done')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
    due_date DATE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Team Members Table
```sql
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Design Decisions:**
- `ON DELETE CASCADE` for project-task relationship: Deleting a project removes all its tasks
- `ON DELETE SET NULL` for task assignments: Removing a team member unassigns but keeps tasks
- `status` CHECK constraint: Ensures only valid statuses at database level
- `position` field: Enables custom ordering within each status column
- Indexes on frequently queried fields for optimal performance

## Development

- Enable SQL query logging by setting `echo=True` in `database.py`
- The server runs with auto-reload enabled in development mode
- WebSocket connections are logged to console

## Database Migrations (Optional)

If you want to use Alembic for migrations:

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```
