/**
 * Team Member Dialog Component
 * Modal for managing team members
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useApp } from '../contexts/AppContext';
import * as api from '../services/api';

const TeamMemberDialog = ({ open, onClose }) => {
  const { teamMembers, fetchTeamMembers } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      await api.createTeamMember({ name, email });
      setName('');
      setEmail('');
      await fetchTeamMembers();
    } catch (error) {
      alert('Failed to add team member');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Delete team member "${memberName}"?`)) {
      try {
        await api.deleteTeamMember(memberId);
        await fetchTeamMembers();
      } catch (error) {
        alert('Failed to delete team member');
        console.error(error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Team Members</DialogTitle>
      <DialogContent>
        {/* Add New Member Form */}
        <Box component="form" onSubmit={handleAddMember} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add New Member
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Team Members List */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Team Members ({teamMembers.length})
        </Typography>
        {teamMembers.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No team members yet</Typography>
          </Box>
        ) : (
          <List>
            {teamMembers.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMemberDialog;
