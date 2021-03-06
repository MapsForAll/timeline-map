export function dateFromString(dateStr: string): Date | undefined {
    if (dateStr && dateStr.length > 0 && dateStr !== '0') {
        const count = (dateStr.match(/\//g) || []).length;

        if (count === 0) {
            const date = new Date();
            date.setFullYear(parseInt(dateStr));
            return date;
        } else if (count === 1) {
            const dateParts: string[] = dateStr.split('/');
            return new Date(parseInt(dateParts[1]), parseInt(dateParts[0]) - 1);
        }

        const dateParts: string[] = dateStr.split('/');
        return new Date(parseInt(dateParts[2]), parseInt(dateParts[0]) - 1, parseInt(dateParts[1]));
    }
    return undefined;
}

export function dateFromTime(time: number): Date {
    const date = new Date();
    date.setTime(time);
    return date;
}
