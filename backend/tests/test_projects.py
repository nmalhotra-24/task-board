"""Tests for project API endpoints"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.project import Project

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_project():
    """Test creating a new project"""
    response = client.post(
        "/api/projects/",
        json={"name": "Test Project", "description": "Test Description"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["description"] == "Test Description"
    assert "id" in data
    assert "created_at" in data


def test_get_projects():
    """Test getting all projects"""
    # Create test projects
    client.post("/api/projects/", json={"name": "Project 1"})
    client.post("/api/projects/", json={"name": "Project 2"})
    
    response = client.get("/api/projects/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_project_by_id():
    """Test getting a specific project"""
    # Create project
    create_response = client.post(
        "/api/projects/",
        json={"name": "Test Project"}
    )
    project_id = create_response.json()["id"]
    
    # Get project
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id
    assert data["name"] == "Test Project"


def test_update_project():
    """Test updating a project"""
    # Create project
    create_response = client.post(
        "/api/projects/",
        json={"name": "Original Name"}
    )
    project_id = create_response.json()["id"]
    
    # Update project
    response = client.put(
        f"/api/projects/{project_id}",
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


def test_delete_project():
    """Test deleting a project"""
    # Create project
    create_response = client.post(
        "/api/projects/",
        json={"name": "To Delete"}
    )
    project_id = create_response.json()["id"]
    
    # Delete project
    response = client.delete(f"/api/projects/{project_id}")
    assert response.status_code == 204
    
    # Verify deletion
    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 404


def test_project_not_found():
    """Test getting non-existent project"""
    response = client.get("/api/projects/999")
    assert response.status_code == 404
