import { format, parse } from 'date-fns';

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / 1024 ** i;
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatMessageTime(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return format(date, 'h:mm a');
    }
    return `${format(date, 'MMM d')} ${format(date, 'h:mm a')}`;
  } catch {
    return '';
  }
}

export function formatUploadedAt(dateString) {
  try {
    const parsed = parse(dateString, 'MMMM d, yyyy h:mm a', new Date());
    return format(parsed, 'MMM d, yyyy · h:mm a');
  } catch {
    return dateString;
  }
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatLastChecked(isoString) {
  if (!isoString) return '—';
  try {
    return format(new Date(isoString), 'MMM d, yyyy · h:mm:ss a');
  } catch {
    return '—';
  }
}

export function estimateChunks(pages) {
  return Math.round(pages * 6.5 + randomInt(10, 40));
}
