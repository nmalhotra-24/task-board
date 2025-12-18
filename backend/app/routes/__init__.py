"""API routes"""

from app.routes.projects import router as projects_router
from app.routes.tasks import router as tasks_router
from app.routes.team_members import router as team_members_router

__all__ = ["projects_router", "tasks_router", "team_members_router"]
