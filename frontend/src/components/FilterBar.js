/**
 * Filter Bar Component
 * Provides search, filtering, and sorting controls for tasks
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useApp } from '../contexts/AppContext';
import { TASK_PRIORITY, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../utils/constants';

const FilterBar = () => {
  const { filters, setFilters, teamMembers } = useApp();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      priority: '',
      assignee: '',
      sortBy: 'created_at',
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.priority,
    filters.assignee,
    filters.sortBy !== 'created_at' ? filters.sortBy : null,
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: '#f9f9f9',
        borderRadius: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search tasks..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        sx={{ minWidth: 250, flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Priority Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {Object.values(TASK_PRIORITY).map((priority) => (
            <MenuItem key={priority} value={priority}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: TASK_PRIORITY_COLORS[priority],
                  }}
                />
                {TASK_PRIORITY_LABELS[priority]}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Assignee Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Assignee</InputLabel>
        <Select
          value={filters.assignee || ''}
          label="Assignee"
          onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {teamMembers.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {member.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sort By */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={filters.sortBy || 'created_at'}
          label="Sort By"
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <MenuItem value="created_at">Created Date</MenuItem>
          <MenuItem value="due_date">Due Date</MenuItem>
          <MenuItem value="priority">Priority</MenuItem>
        </Select>
      </FormControl>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          sx={{ textTransform: 'none' }}
        >
          Clear Filters
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Button>
      )}
    </Box>
  );
};

export default FilterBar;
