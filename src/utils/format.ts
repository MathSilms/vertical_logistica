export function parseLine(line: string) {
    const userId = Number(line.slice(0, 10));
    const userName = line.slice(10, 50);
    const orderId = Number(line.slice(50, 60));
    const productId = Number(line.slice(60, 70));
    const value = Number(line.slice(70, 80).trim());
    const date = line.slice(80, 88);

    return { userId, userName, orderId, productId, value, date };
}

export function toISODate(raw: string) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${year}-${month}-${day}`;
}