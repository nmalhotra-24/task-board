# Task Board Frontend

React-based frontend for the collaborative task management application with real-time updates via WebSocket.

## Features

- 📋 Kanban board interface with drag-and-drop
- 🎨 Material-UI components and responsive design
- 🔄 Real-time updates via WebSocket - instant synchronization across all clients
- 🔍 Advanced search and filtering (status, priority, assignee)
- 📊 Flexible sorting options (due date, priority, created date)
- 👥 Team member management with assignment capabilities
- 📁 Multi-project management
- ⚡ Context-based state management (no Redux needed)

## Architecture

### Component Structure
```
src/
├── components/
│   ├── Header.js                # Top navigation bar with connection status
│   ├── ProjectList.js           # Sidebar with all projects
│   ├── ProjectDialog.js         # Create/edit project modal
│   ├── KanbanBoard.js           # Main board container with columns
│   ├── KanbanColumn.js          # Single status column (To-do/In Progress/Done)
│   ├── TaskCard.js              # Individual task card with drag handle
│   ├── TaskDialog.js            # Create/edit task modal with all fields
│   ├── FilterBar.js             # Search + filters (priority, assignee, sort)
│   └── TeamMemberDialog.js      # Add/edit team members
├── contexts/
│   └── AppContext.js            # Global state management
├── hooks/
│   └── useWebSocket.js          # Custom hook for WebSocket connection
├── services/
│   └── api.js                   # Axios client + all API methods
├── utils/
│   ├── constants.js             # Status/priority enums, color mappings
│   └── dateHelpers.js           # Date formatting utilities
├── App.js                       # Main app component
├── App.css                      # Global styles
└── index.js                     # React entry point
```

### State Management Strategy

Uses **React Context API** for global state management:

```javascript
AppContext provides:
{
  // Data State
  projects: [],              // All projects
  currentProject: null,      // Currently selected project
  tasks: [],                 // Tasks for current project
  teamMembers: [],           // All team members
  
  // UI State
  filters: {
    status: null,            // Filter by status
    priority: null,          // Filter by priority
    assignedTo: null,        // Filter by team member
    search: '',              // Search query
    sortBy: 'created_at',    // Sort field
    order: 'asc'             // Sort order
  },
  loading: boolean,
  error: string | null,
  
  // Actions
  setCurrentProject: (project) => {},
  fetchProjects: () => {},
  fetchTasks: (projectId) => {},
  fetchTeamMembers: () => {},
  createProject: (data) => {},
  updateProject: (id, data) => {},
  deleteProject: (id) => {},
  createTask: (data) => {},
  updateTask: (id, data) => {},
  deleteTask: (id) => {},
  createTeamMember: (data) => {},
  updateTeamMember: (id, data) => {},
  deleteTeamMember: (id) => {},
  setFilters: (filters) => {},
  
  // WebSocket State
  wsConnected: boolean       // Connection status indicator
}
```

### Real-Time Flow

**How WebSocket Updates Work:**

1. **Connection Established:**
   ```
   App loads → useWebSocket hook → Connects to ws://localhost:8000/ws/{clientId}
   → Connection status visible in Header component
   ```

2. **User Makes Change:**
   ```
   User drags task to "Done"
   → TaskCard onDragEnd handler
   → api.updateTask(id, { status: "done" })
   → HTTP PUT request to backend
   → Backend updates database
   → Backend broadcasts WebSocket message to ALL clients
   ```

3. **All Clients Receive Update:**
   ```
   WebSocket message received
   → useWebSocket onMessage callback
   → AppContext.handleWebSocketMessage()
   → Updates tasks state
   → All KanbanBoards re-render instantly
   → Change appears immediately without refresh
   ```

**Message Types:**
- `task_created` - New task added
- `task_updated` - Task modified (status, priority, assignee, etc.)
- `task_deleted` - Task removed
- `project_created` - New project added
- `project_updated` - Project modified
- `project_deleted` - Project removed
- `team_member_created` - New team member added
- `team_member_updated` - Team member modified
- `team_member_deleted` - Team member removed

### Key Component Interactions

**1. Project Selection Flow:**
```
ProjectList (sidebar)
  ↓ User clicks project
setCurrentProject(project)
  ↓ Triggers effect in AppContext
fetchTasks(project.id)
  ↓ API call
KanbanBoard re-renders with new tasks
```

**2. Drag-and-Drop Flow:**
```
User drags TaskCard
  ↓ react-beautiful-dnd
onDragEnd handler in KanbanBoard
  ↓ Determines new status
api.updateTask(id, { status: newStatus })
  ↓ Backend updates & broadcasts
WebSocket message received
  ↓ All clients update
UI updates instantly everywhere
```

**3. Filtering Flow:**
```
FilterBar
  ↓ User changes filter/search
setFilters({ ...filters, newFilter })
  ↓ Updates context state
KanbanBoard applies filters locally
  ↓ Filters task array
Re-renders with filtered tasks
```

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend server running on port 8000

### Installation

1. Navigate to the frontend directory:
```bash
cd task-board/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

