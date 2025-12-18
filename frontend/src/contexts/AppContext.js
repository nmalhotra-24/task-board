/**
 * App Context
 * Global state management using React Context API
 */

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    assignedTo: null,
    search: '',
    sortBy: 'created_at',
    order: 'asc',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Processing WebSocket message:', message);
    
    switch (message.type) {
      case 'project_created':
        setProjects((prev) => {
          // Check if project already exists
          if (prev.some(p => p.id === message.data.id)) {
            return prev;
          }
          return [...prev, message.data];
        });
        break;
        
      case 'project_updated':
        setProjects((prev) =>
          prev.map((project) =>
            project.id === message.data.id ? message.data : project
          )
        );
        break;
        
      case 'project_deleted':
        setProjects((prev) =>
          prev.filter((project) => project.id !== message.data.id)
        );
        // If current project was deleted, clear it
        setCurrentProject((current) => 
          current?.id === message.data.id ? null : current
        );
        break;
        
      case 'task_created':
        setTasks((prev) => {
          // Check if task already exists
          if (prev.some(t => t.id === message.data.id)) {
            return prev;
          }
          return [...prev, message.data];
        });
        break;
        
      case 'task_updated':
        setTasks((prev) =>
          prev.map((task) =>
            task.id === message.data.id ? message.data : task
          )
        );
        break;
        
      case 'task_deleted':
        setTasks((prev) =>
          prev.filter((task) => task.id !== message.data.id)
        );
        break;
        
      case 'team_member_created':
        setTeamMembers((prev) => {
          // Check if team member already exists
          if (prev.some(tm => tm.id === message.data.id)) {
            return prev;
          }
          return [...prev, message.data];
        });
        break;
        
      case 'team_member_updated':
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === message.data.id ? message.data : member
          )
        );
        break;
        
      case 'team_member_deleted':
        setTeamMembers((prev) =>
          prev.filter((member) => member.id !== message.data.id)
        );
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // WebSocket connection
  const { connected: wsConnected } = useWebSocket({
    onMessage: handleWebSocketMessage,
    enabled: true,
  });

  // Fetch functions
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async (projectId) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await api.getTasks(projectId, filters);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch tasks from all projects
      const taskPromises = projects.map(project => 
        api.getTasks(project.id, filters)
      );
      const responses = await Promise.all(taskPromises);
      const allTasks = responses.flatMap(response => response.data);
      setTasks(allTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projects, filters]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await api.getTeamMembers();
      setTeamMembers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team members');
      console.error(err);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, [fetchProjects, fetchTeamMembers]);

  // Fetch tasks when project changes or when filtering
  useEffect(() => {
    // Check if any filter is active
    const hasActiveFilters = filters.search || filters.priority || filters.assignee || filters.sortBy !== 'created_at';
    
    if (hasActiveFilters && projects.length > 0) {
      // When filtering, fetch tasks from all projects
      fetchAllTasks();
    } else if (currentProject) {
      // Otherwise, fetch tasks for current project only
      fetchTasks(currentProject.id);
    } else {
      setTasks([]);
    }
  }, [currentProject, fetchTasks, fetchAllTasks, filters.search, filters.priority, filters.assignee, filters.sortBy, projects.length]);

  const value = {
    // State
    projects,
    currentProject,
    tasks,
    teamMembers,
    filters,
    loading,
    error,
    wsConnected,
    
    // Setters
    setProjects,
    setCurrentProject,
    setTasks,
    setTeamMembers,
    setFilters,
    setError,
    
    // Fetch functions
    fetchProjects,
    fetchTasks,
    fetchAllTasks,
    fetchTeamMembers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
