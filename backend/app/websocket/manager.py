"""WebSocket manager for real-time updates"""

from fastapi import WebSocket
from typing import List, Dict
import json


class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts messages to all connected clients.
    
    This enables real-time updates across all users viewing the application.
    """
    
    def __init__(self):
        # Store active WebSocket connections
        self.active_connections: List[WebSocket] = []
        # Optional: Store connection metadata (client_id, etc.)
        self.connection_metadata: Dict[WebSocket, dict] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            client_id: Optional client identifier
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        if client_id:
            self.connection_metadata[websocket] = {"client_id": client_id}
        print(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: The WebSocket connection to remove
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """
        Send a message to all connected clients.
        
        Args:
            message: Dictionary containing the message to broadcast
                    Should include 'type' and 'data' keys
        
        Example message:
            {
                "type": "task_updated",
                "data": {
                    "id": 1,
                    "title": "Updated task",
                    "status": "in_progress"
                }
            }
        """
        # Remove dead connections
        dead_connections = []
        
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message to client: {e}")
                dead_connections.append(connection)
        
        # Clean up dead connections
        for dead_connection in dead_connections:
            self.disconnect(dead_connection)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send a message to a specific client.
        
        Args:
            message: Dictionary containing the message
            websocket: The target WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)


# Global connection manager instance
manager = ConnectionManager()
