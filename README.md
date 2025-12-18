# Task Board Application

A collaborative task management application with real-time updates, enabling teams to manage projects and track task progress through an intuitive Kanban-style interface.

## Tech Stack

- **Frontend**: React 19 + Material-UI
- **Backend**: Python FastAPI
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Real-time**: WebSockets
- **Testing**: pytest (backend), Playwright (E2E)

## Prerequisites

- Python 3.8-3.12 (Python 3.13+ requires updated dependencies)
- Node.js 16+
- npm or yarn
- SQLite (included by default, no setup needed)
- PostgreSQL 13+ (optional for production)

## Features

### Core Features
- ✅ **Project Management**: Create, edit, and manage multiple projects
- ✅ **Task Operations**: Full CRUD functionality for tasks
- ✅ **Status Flow**: Task progression (To-do → In Progress → Done)
- ✅ **Team Management**: Manage team members and assignments
- ✅ **Drag-and-Drop**: Intuitive task status changes with react-beautiful-dnd

### Enhanced Features
- ✅ **Task Priority Levels**: Low, Medium, High with color-coded visual indicators
- ✅ **Real-time Updates**: Live synchronization across all connected clients via WebSockets
- ✅ **Due Dates**: With overdue warnings and date formatting
- ✅ **Advanced Filtering**: Filter by status, priority, and assigned team member
- ✅ **Full-Text Search**: Search across task titles and descriptions
- ✅ **Flexible Sorting**: Sort by due date, priority, or creation date (ascending/descending)
- ✅ **Instant Updates**: All CRUD operations broadcast in real-time - no page refresh needed
- ✅ **Multi-Client Sync**: Changes made by any user appear instantly for all connected users
- ✅ **WebSocket Connection Status**: Visual indicator showing connection state
- ✅ **Responsive Design**: Works seamlessly on desktop and tablet devices

## Project Structure

```
task-board/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, WebSocket endpoint
│   │   ├── database.py          # SQLAlchemy configuration
│   │   ├── models/              # Database ORM models
│   │   │   ├── project.py       # Project model
│   │   │   ├── task.py          # Task model with status/priority enums
│   │   │   └── team_member.py   # Team member model
│   │   ├── schemas/             # Pydantic validation schemas
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── team_member.py
│   │   ├── routes/              # API endpoint routers
│   │   │   ├── projects.py      # Project CRUD endpoints
│   │   │   ├── tasks.py         # Task CRUD + filtering/search
│   │   │   └── team_members.py  # Team member CRUD endpoints
│   │   └── websocket/           # WebSocket real-time manager
│   │       └── manager.py       # ConnectionManager class
│   ├── tests/
│   │   └── test_projects.py     # Pytest unit tests
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variables template
│   ├── .gitignore
│   └── README.md                # Backend setup instructions
├── frontend/                    # (Coming next)
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md                    # This file
```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (optional but recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip3 install -r requirements.txt
```

**Note**: If using Python 3.13+, upgrade dependencies:
```bash
pip3 install --upgrade fastapi pydantic sqlalchemy uvicorn
```

4. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

**Database**: SQLite is used by default (taskboard.db). No manual setup required.

###  Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm start
```

Then open `http://localhost:3000` in your browser!

**API Documentation**: Interactive API docs available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` (ReDoc)

**Important Notes**:
- Make sure the **backend is running first** on port 8000 before starting the frontend
- Run backend and frontend **in separate terminal windows** (they both need to run simultaneously)
- Frontend is pre-configured to connect to `http://localhost:8000` for the API
- The application will be available at `http://localhost:3000` once both servers are running

## Shutting Down Servers

**Stop Backend:**
```bash
pkill -f "uvicorn app.main:app"
```

**Stop Frontend:**
```bash
pkill -f "react-scripts start"
```


## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### End-to-End Tests
```bash
cd frontend
npm run test:e2e
```

## API Endpoints

**API Documentation**: Interactive API docs available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` (ReDoc)

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

**Example:**
```bash
# List all projects
curl http://localhost:8000/api/projects

# Create a new project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "Project description"}'
```

### Tasks
- `GET /api/projects/{project_id}/tasks` - List tasks for a project
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Example:**
```bash
# List tasks for project 1
curl http://localhost:8000/api/projects/1/tasks

# Create a new task
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "project_id": 1,
    "status": "to_do",
    "priority": "high",
    "assigned_to": 1,
    "due_date": "2025-12-31"
  }'

# Update task status
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "status": "in_progress",
    "priority": "medium"
  }'
```

### Team Members
- `GET /api/team-members` - List all team members
- `POST /api/team-members` - Add team member
- `PUT /api/team-members/{id}` - Update team member
- `DELETE /api/team-members/{id}` - Remove team member

**Example:**
```bash
# List all team members
curl http://localhost:8000/api/team-members

# Create a new team member
curl -X POST http://localhost:8000/api/team-members/ \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### WebSocket
- `WS /ws/{client_id}` - WebSocket connection for real-time updates

## Architecture Overview

### System Architecture
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         React Frontend (Port 3000)                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │ │
│  │  │   Project    │  │   Kanban     │  │  Task Card   │  │  Filter    │  │ │
│  │  │   Sidebar    │  │   Board      │  │  + Drag/Drop │  │   Bar      │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │ │
│  │                                                                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  State: React Context + useState                                  │  │ │
│  │  │  - Projects, Tasks, Team Members                                  │  │ │
│  │  │  - Current Filters (status, priority, assignee, search)           │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   HTTP REST API         WebSocket (WS)
                        │                       │
┌──────────────────────┴───────────────────────┴───────────────────────────────┐
│                          APPLICATION LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     FastAPI Backend (Port 8001)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │ │
│  │  │   Projects   │  │    Tasks     │  │    Team      │  │  WebSocket │  │ │
│  │  │   Routes     │  │   Routes +   │  │   Members    │  │  Manager   │  │ │
│  │  │   (CRUD)     │  │   Filtering  │  │   Routes     │  │            │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │ │
│  │                                                                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Pydantic Schemas (Request/Response Validation)                   │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  SQLAlchemy ORM Models (Project, Task, TeamMember)               │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────┬───────────────────────────────────┘
                                           │ SQL Queries
┌──────────────────────────────────────────┴───────────────────────────────────┐
│                             DATA LAYER                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    SQLite Database (Development)                         │ │
│  │                    PostgreSQL (Production Ready)                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │ │
│  │  │   projects   │  │    tasks     │  │ team_members │                  │ │
│  │  │   table      │  │    table     │  │    table     │                  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Communication Flow:**
1. **REST API (HTTP)**: 
   - Frontend → Backend: CRUD operations (GET, POST, PUT, DELETE)
   - Backend validates with Pydantic → SQLAlchemy queries database
   - Response serialized back to frontend

2. **WebSocket (Real-time)**:
   - Frontend establishes WS connection on load
   - Backend broadcasts task updates to ALL connected clients
   - Frontend updates UI instantly without page refresh

3. **Database**:
   - SQLite for development (easy setup, no installation)
   - Production-ready for PostgreSQL (just change DATABASE_URL)
   - Foreign key constraints ensure data integrity

## Development Notes

- **Backend**: http://localhost:8000 (API docs at /docs)
- **Frontend**: http://localhost:3000
- **Database**: SQLite (taskboard.db in backend directory)
- **WebSocket**: Automatically connects on frontend load
- **Hot reload**: Enabled for both frontend and backend
- **CORS**: Configured to allow frontend on port 3000

## Troubleshooting

**Database connection issues:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file

**WebSocket connection fails:**
- Ensure backend is running
- Check CORS settings in backend

**Frontend can't reach backend:**
- Verify backend URL in frontend `.env`
- Check that both servers are running

## Future Enhancements

- User authentication and authorization
- Task comments and attachments
- Email notifications
- Task dependencies
- Sprint/milestone management
- Time tracking
