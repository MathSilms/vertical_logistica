import { insertOrders } from "../repositories/orderRepository";
import {
    getNextPendingTask,
    markTaskAsDone,
    markTaskAsError,
} from "../repositories/queueRepository";
import { toISODate } from "../utils/date";
import { ObjectId } from "mongodb";

export async function parseAndInsert(raw: string): Promise<void> {
    try {
        const lines = raw.trim().split(/\r?\n/);
        const usersMap: Record<string, any> = {};

        for (const line of lines) {
            const { userId, userName, orderId, productId, value, date } = parseLine(line);

            if (!usersMap[userId]) {
                usersMap[userId] = {
                    user_id: userId,
                    name: userName,
                    orders: {},
                };
            }

            const user = usersMap[userId];
            const orderKey = `${orderId}_${date}`;

            if (!user.orders[orderKey]) {
                user.orders[orderKey] = {
                    order_id: orderId,
                    date: date,
                    total: 0,
                    products: [],
                };
            }

            user.orders[orderKey].products.push({ product_id: productId, value });
            user.orders[orderKey].total += value;
        }

        const docs = Object.values(usersMap).map((user: any) => ({
            ...user,
            orders: Object.values(user.orders).map((order: any) => ({
                ...order,
                total: Number(order.total.toFixed(2))
            })),
        }));

        await insertOrders(docs);
    } catch (err) {
        throw new Error(`Failed to parse ${err}`);
    }
}

export async function updateTask(_id: ObjectId, status: string) {

    if (status === 'done')
        markTaskAsDone(_id)

    if (status === 'error')
        markTaskAsError(_id)
}

export async function getNextTask() {
    return getNextPendingTask();
}

function parseLine(line: string) {

    const lineSplit = line.trim().split(/\s+/).filter(Boolean);

    if (lineSplit.length < 4) throw new Error("invalid Row")

    const rawProductOrder = lineSplit[lineSplit.length - 2];
    const rawNumericPart = rawProductOrder.slice(-20);
    const rawValueAndDate = lineSplit[lineSplit.length - 1];


    const userId = Number(lineSplit[0]);
    const userName = getName(lineSplit, rawProductOrder);
    const { orderId, productId } = getIds(rawNumericPart)
    const { value, date } = getValueAndDate(rawValueAndDate);

    return { userId, userName, orderId, productId, value, date };
}

function getName(lineSplit: string[], rawProductOrder: string) {
    const nameParts = lineSplit.slice(1, lineSplit.length - 2);
    const nameRoot = rawProductOrder.slice(0, -20).trim();
    const userName = [...nameParts, nameRoot].join(' ');

    return userName.trim();
}

function getIds(rawNumericPart: string) {
    const orderId = Number(rawNumericPart.slice(0, 10));
    const productId = Number(rawNumericPart.slice(10, 20));

    return { orderId, productId };
}

function getValueAndDate(valueAndDate: string) {
    const rawDate = valueAndDate.slice(-8);
    const value = Number(valueAndDate.slice(0, valueAndDate.length - 8));

    const date = toISODate(rawDate);
    return { value, date };
}

