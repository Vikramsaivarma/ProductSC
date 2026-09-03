export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(status: 'compliant' | 'partial' | 'non_compliant'): string {
  switch (status) {
    case 'compliant':
      return 'text-green-600 bg-green-100';
    case 'partial':
      return 'text-yellow-600 bg-yellow-100';
    case 'non_compliant':
      return 'text-red-600 bg-red-100';
  }
}

export function getSeverityColor(severity: 'critical' | 'major' | 'minor'): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'major':
      return 'text-orange-600 bg-orange-100';
    case 'minor':
      return 'text-blue-600 bg-blue-100';
  }
}

export function getRoleBadge(role: 'admin' | 'officer' | 'viewer'): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'officer':
      return 'bg-blue-100 text-blue-700';
    case 'viewer':
      return 'bg-gray-100 text-gray-700';
  }
}