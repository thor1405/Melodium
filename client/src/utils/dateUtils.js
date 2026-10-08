import { format, parseISO, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString, formatStr = 'dd MMM yyyy') => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' && !dateString.includes('T')
      ? new Date(`${dateString}T00:00:00`)
      : new Date(dateString);
    return format(date, formatStr);
  } catch (e) {
    return dateString;
  }
};

export const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatSlotRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  return `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return '';
  }
};

export const getLocalDateString = (dateObj = new Date()) => {
  if (!dateObj) return '';
  const date = typeof dateObj === 'string'
    ? (!dateObj.includes('T') ? new Date(`${dateObj}T00:00:00`) : new Date(dateObj))
    : dateObj;
  return format(date, 'yyyy-MM-dd');
};

export const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDayLabel = (dateString) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, dd MMM');
};
