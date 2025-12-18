/**
 * Kanban Column Component
 * Droppable column container for tasks with a specific status
 */

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { TASK_STATUS_LABELS } from '../utils/constants';

const KanbanColumn = ({ status, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  return (
    <Paper
      sx={{
        p: 2,
        minWidth: 320,
        maxWidth: 400,
        height: 'calc(100vh - 250px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Column Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {TASK_STATUS_LABELS[status]}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '50%',
              px: 1,
              py: 0.25,
              minWidth: 24,
              textAlign: 'center',
            }}
          >
            {tasks.length}
          </Typography>
        </Box>
      </Box>

      {/* Droppable Task List */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
              borderRadius: 1,
              transition: 'background-color 0.2s',
              p: 0.5,
            }}
          >
            {tasks.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.disabled',
                }}
              >
                <Typography variant="body2">No tasks</Typography>
              </Box>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

export default KanbanColumn;
