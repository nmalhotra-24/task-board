"""
FastAPI Task Board Application

A collaborative task management application with real-time updates.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import init_db
from app.routes import projects_router, tasks_router, team_members_router
from app.websocket.manager import manager

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Task Board API",
    description="A collaborative task management application with real-time updates",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    print("Initializing database...")
    init_db()
    print("Database initialized successfully")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Task Board API is running"}


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time updates.
    
    Clients connect to this endpoint to receive real-time updates
    when tasks are created, updated, or deleted.
    
    Args:
        client_id: Unique identifier for the client connection
    """
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection alive and listen for messages
            # Clients can send messages if needed (e.g., ping/pong)
            data = await websocket.receive_text()
            
            # Optional: Handle incoming messages from clients
            # For now, we just echo back
            await manager.send_personal_message(
                {"type": "echo", "message": f"Received: {data}"},
                websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(websocket)


# Register API routers
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(team_members_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Task Board API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
