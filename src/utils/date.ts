export function isValidDate(date: string | undefined): boolean | null {
    // Espera formato yyyy-mm-dd
    if (!date) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function toISODate(raw: string) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${year}-${month}-${day}`;
}