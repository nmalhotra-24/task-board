/**
 * Kanban Board Component
 * Main board with drag-and-drop functionality for tasks
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import TaskDialog from './TaskDialog';
import { useApp } from '../contexts/AppContext';
import { TASK_STATUS, STATUS_COLUMNS } from '../utils/constants';
import * as api from '../services/api';

const KanbanBoard = () => {
  const { currentProject, tasks, filters, fetchTasks } = useApp();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState(TASK_STATUS.TO_DO);
  const [isDragEnabled, setIsDragEnabled] = useState(false);

  // Enable drag after initial render to avoid strict mode issues
  useEffect(() => {
    const timer = setTimeout(() => setIsDragEnabled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!currentProject) return [];

    // If any filter is active, show tasks from all projects; otherwise, filter by current project
    const hasActiveFilters = filters.search || filters.priority || filters.assignee || filters.sortBy !== 'created_at';
    let result = hasActiveFilters 
      ? tasks 
      : tasks.filter(task => task.project_id === currentProject.id);

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    if (filters.assignee) {
      result = result.filter(task => task.assigned_to === filters.assignee);
    }

    // Apply sorting
    if (filters.sortBy === 'due_date') {
      result.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    } else if (filters.sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      // Default: sort by created date (newest first)
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [tasks, currentProject, filters]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      [TASK_STATUS.TO_DO]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.DONE]: [],
    };

    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // No movement
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    try {
      // Update task status
      await api.updateTask(taskId, { status: newStatus });
      // Fetch updated tasks (WebSocket will also broadcast this)
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      try {
        await api.deleteTask(task.id);
        await fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleTaskDialogSuccess = async () => {
    setTaskDialogOpen(false);
    setEditingTask(null);
    await fetchTasks();
  };

  if (!currentProject) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a project to view tasks
        </Typography>
      </Box>
    );
  }

  if (!isDragEnabled) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTask(null);
            setDefaultStatus(TASK_STATUS.TO_DO);
            setTaskDialogOpen(true);
          }}
          sx={{ textTransform: 'none' }}
        >
          Add Task
        </Button>
      </Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
          }}
        >
          {STATUS_COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onAddTask={(columnStatus) => {
                setEditingTask(null);
                setDefaultStatus(columnStatus);
                setTaskDialogOpen(true);
              }}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </Box>
      </DragDropContext>

      <TaskDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSuccess={handleTaskDialogSuccess}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </>
  );
};

export default KanbanBoard;
