/**
 * Task Card Component
 * Individual draggable task card displayed in Kanban columns
 */

import React from 'react';
import { Paper, Typography, Chip, Avatar, IconButton, Box } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from '../utils/constants';
import { getDueDateInfo } from '../utils/dateHelpers';
import { useApp } from '../contexts/AppContext';

const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const { teamMembers } = useApp();
  
  const assignedMember = teamMembers.find(m => m.id === task.assigned_to);
  const dueDateInfo = task.due_date ? getDueDateInfo(task.due_date) : null;
  const priorityColor = TASK_PRIORITY_COLORS[task.priority] || '#757575';

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            p: 2,
            mb: 1.5,
            borderLeft: `4px solid ${priorityColor}`,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            cursor: 'grab',
            '&:hover': {
              boxShadow: 3,
              '& .task-actions': {
                opacity: 1,
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
              {task.title}
            </Typography>
            <Box className="task-actions" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => onEdit(task)} sx={{ p: 0.5 }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(task)} sx={{ p: 0.5 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label={TASK_PRIORITY_LABELS[task.priority]}
              size="small"
              sx={{
                backgroundColor: priorityColor,
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            />

            {dueDateInfo && (
              <Chip
                label={dueDateInfo.text}
                size="small"
                sx={{
                  backgroundColor: dueDateInfo.color,
                  color: 'white',
                  fontSize: '0.7rem',
                }}
              />
            )}

            {assignedMember && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: '#1976d2',
                  }}
                >
                  {assignedMember.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {assignedMember.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Draggable>
  );
};

export default TaskCard;
