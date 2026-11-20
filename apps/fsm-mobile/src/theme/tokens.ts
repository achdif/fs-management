// Design tokens — Flow 1 (Figma_Mobile_Design_Flow_1.md)
export const colors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFF',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#A16207',
  warningBg: '#FEF9C3',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
  neutral: '#4B5563',
  neutralBg: '#F3F4F6',
} as const;

export const radius = {
  card: 12,
  input: 12,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const fontSize = {
  caption: 11,
  small: 12,
  body: 14,
  title: 20,
  heading: 28,
} as const;
