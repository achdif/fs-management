import type { EstimatedBooking } from '@fs-management/prebook';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatEstimatedBooking = (eb: EstimatedBooking | null | undefined): string => {
  if (!eb) return '—';
  if (eb.date && eb.month && eb.year) {
    return `${eb.date} ${MONTHS[eb.month - 1]} ${eb.year}`;
  }
  if (eb.month && eb.year) {
    return `${MONTHS[eb.month - 1]} ${eb.year}`;
  }
  if (eb.year) {
    return String(eb.year);
  }
  return '—';
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
};

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};
