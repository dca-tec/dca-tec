/**
 * Safe date and time formatting utilities for Firestore timestamps,
 * localStorage parsed objects, ISO strings, and standard Date instances.
 */

export function formatDateTime(
  timestamp: any,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!timestamp) return '';
  try {
    if (typeof timestamp.toDate === 'function') {
      const d = timestamp.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleString('pt-BR', options) : '';
    }
    if (typeof timestamp.seconds === 'number') {
      const d = new Date(timestamp.seconds * 1000);
      return !isNaN(d.getTime()) ? d.toLocaleString('pt-BR', options) : '';
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const d = new Date(timestamp);
      return !isNaN(d.getTime()) ? d.toLocaleString('pt-BR', options) : '';
    }
    if (timestamp instanceof Date) {
      return !isNaN(timestamp.getTime()) ? timestamp.toLocaleString('pt-BR', options) : '';
    }
  } catch {
    return '';
  }
  return '';
}

export function formatDate(
  timestamp: any,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  if (!timestamp) return '';
  try {
    if (typeof timestamp.toDate === 'function') {
      const d = timestamp.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR', options) : '';
    }
    if (typeof timestamp.seconds === 'number') {
      const d = new Date(timestamp.seconds * 1000);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR', options) : '';
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const d = new Date(timestamp);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR', options) : '';
    }
    if (timestamp instanceof Date) {
      return !isNaN(timestamp.getTime()) ? timestamp.toLocaleDateString('pt-BR', options) : '';
    }
  } catch {
    return '';
  }
  return '';
}

export function formatTime(
  timestamp: any,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!timestamp) return '';
  try {
    if (typeof timestamp.toDate === 'function') {
      const d = timestamp.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleTimeString('pt-BR', options) : '';
    }
    if (typeof timestamp.seconds === 'number') {
      const d = new Date(timestamp.seconds * 1000);
      return !isNaN(d.getTime()) ? d.toLocaleTimeString('pt-BR', options) : '';
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const d = new Date(timestamp);
      return !isNaN(d.getTime()) ? d.toLocaleTimeString('pt-BR', options) : '';
    }
    if (timestamp instanceof Date) {
      return !isNaN(timestamp.getTime()) ? timestamp.toLocaleTimeString('pt-BR', options) : '';
    }
  } catch {
    return '';
  }
  return '';
}
