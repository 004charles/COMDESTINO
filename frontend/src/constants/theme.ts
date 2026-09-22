export const colors = {
  green: '#00A651',
  greenDark: '#007A3D',
  greenLight: '#E8F5ED',
  gold: '#FFD700',
  goldDark: '#CCAC00',
  goldLight: '#FFF8E1',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
  black: '#000000',
  error: '#EF4444',
  success: '#00A651',
  warning: '#F59E0B',
};

export const formatKz = (value: number | string): string => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '0 Kz';
  return n.toLocaleString('pt-AO') + ' Kz';
};
