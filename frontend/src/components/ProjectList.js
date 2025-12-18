/**
 * Project List Component
 * Sidebar showing all projects with ability to select, create, and delete
 */

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import ProjectDialog from './ProjectDialog';
import * as api from '../services/api';

const ProjectList = () => {
  const { projects, currentProject, setCurrentProject, fetchProjects } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectProject = (project) => {
    setCurrentProject(project);
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      try {
        await api.deleteProject(projectId);
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }
        fetchProjects();
      } catch (error) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Projects</Typography>
        <IconButton color="primary" onClick={() => setDialogOpen(true)} size="small">
          <AddIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {projects.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No projects yet
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ mt: 1 }}
              size="small"
            >
              Create Project
            </Button>
          </Box>
        ) : (
          projects.map((project) => (
            <ListItem
              key={project.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  size="small"
                  onClick={(e) => handleDelete(e, project.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={currentProject?.id === project.id}
                onClick={() => handleSelectProject(project)}
              >
                <ListItemText
                  primary={project.name}
                  secondary={project.description}
                  secondaryTypographyProps={{
                    noWrap: true,
                    sx: { fontSize: '0.75rem' },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          fetchProjects();
          setDialogOpen(false);
        }}
      />
    </Paper>
  );
};

export default ProjectList;
