import { format } from 'date-fns';

export function getCurrentTime() {
    const now = new Date();
    return format(now, 'MM/dd/yyyy, h:mm a');
}
