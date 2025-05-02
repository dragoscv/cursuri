/**
 * Helper functions for safe date handling and formatting
 */

/**
 * Safely converts a date to ISO string format, handling various input types
 * 
 * @param date - The date to convert (Date, string, number, or any Firebase Timestamp)
 * @returns The ISO string representation of the date or undefined if conversion fails
 */
export function safeToISOString(date: Date | string | number | { toDate(): Date } | any): string | undefined {
    try {
        if (!date) return undefined;

        // Firebase Timestamp or any object with toDate() method
        if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
            return date.toDate().toISOString();
        }

        // Date object
        if (date instanceof Date) {
            return date.toISOString();
        }

        // Convert string or number to Date
        if (typeof date === 'string' || typeof date === 'number') {
            return new Date(date).toISOString();
        }

        return undefined;
    } catch (error) {
        console.error('Error converting date to ISO string:', error);
        return undefined;
    }
}

/**
 * Formats a date to a readable string format
 * 
 * @param date - The date to format
 * @param options - The formatting options
 * @returns The formatted date string
 */
export function formatDate(
    date: Date | string | number | { toDate(): Date } | any,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
): string {
    try {
        if (!date) return '';

        let dateObj: Date;

        // Firebase Timestamp or any object with toDate() method
        if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
            dateObj = date.toDate();
        }
        // Date object
        else if (date instanceof Date) {
            dateObj = date;
        }
        // String or number
        else if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        }
        else {
            return '';
        }

        return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}