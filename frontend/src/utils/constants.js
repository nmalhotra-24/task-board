/**
 * Application Constants
 * Task statuses, priorities, and UI configurations
 */

export const TASK_STATUS = {
  TO_DO: 'to_do',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TO_DO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.DONE]: 'Done',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITY.HIGH]: '#d32f2f',      // Red
  [TASK_PRIORITY.MEDIUM]: '#ed6c02',    // Orange
  [TASK_PRIORITY.LOW]: '#2e7d32',       // Green
};

// Alias for backwards compatibility
export const TASK_PRIORITY_COLORS = PRIORITY_COLORS;

export const STATUS_COLUMNS = [
  TASK_STATUS.TO_DO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
];

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];
