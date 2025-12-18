/**
 * Date Helper Functions
 * Formatting and date calculations
 */

import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const isOverdue = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return isPast(date) && !isToday(date);
};

export const isDueSoon = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const days = differenceInDays(date, new Date());
  return days >= 0 && days <= 3;
};

export const getDueDateInfo = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isOverdue(dateString)) {
    return {
      text: `Overdue ${getRelativeTime(dateString)}`,
      color: 'error',
      severity: 'high',
    };
  }
  
  if (isToday(date)) {
    return {
      text: 'Due today',
      color: 'warning',
      severity: 'medium',
    };
  }
  
  if (isTomorrow(date)) {
    return {
      text: 'Due tomorrow',
      color: 'warning',
      severity: 'medium',
    };
  }
  
  if (isDueSoon(dateString)) {
    const days = differenceInDays(date, new Date());
    return {
      text: `Due in ${days} days`,
      color: 'info',
      severity: 'low',
    };
  }
  
  return {
    text: formatDate(dateString),
    color: 'default',
    severity: 'low',
  };
};
