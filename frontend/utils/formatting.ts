/**
 * Formatting utilities for display values
 */

/**
 * Format a number as currency (token balance)
 */
export function formatCurrency(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null) {
    return '0.00';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a price as percentage (0-100)
 */
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) {
    return '0.00';
  }
  return (price * 100).toFixed(2);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '0.00%';
  }
  return value.toFixed(2) + '%';
}

/**
 * Format date in readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(dateString);
}

/**
 * Truncate long strings
 */
export function truncate(value: string, length: number): string {
  return value.length > length ? value.slice(0, length) + '...' : value;
}

/**
 * Format hash/ID for display
 */
export function formatHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2) return hash;
  return hash.slice(0, chars) + '...' + hash.slice(-chars);
}

/**
 * Convert status to display string
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate ROI percentage
 */
export function calculateROI(invested: number, current: number): number {
  if (invested === 0) return 0;
  return ((current - invested) / invested) * 100;
}

/**
 * Get status badge color
 */
export function getStatusColor(
  status: string
): 'success' | 'warning' | 'error' | 'info' {
  switch (status.toLowerCase()) {
    case 'open':
    case 'pending':
      return 'info';
    case 'win':
    case 'won':
    case 'active':
      return 'success';
    case 'closed':
    case 'resolved':
      return 'warning';
    case 'lost':
    case 'error':
    case 'failed':
      return 'error';
    default:
      return 'info';
  }
}
