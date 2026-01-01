
import { formatDistanceToNow, format } from 'date-fns';

export const getRelativeTime = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const getFullTimestamp = (timestamp: number) => {
  return format(new Date(timestamp), 'PPPP p');
};
