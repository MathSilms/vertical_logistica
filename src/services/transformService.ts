import { toISODate, parseLine } from "../utils/format";
import { insertOrders } from "../repositories/orderRepository";

export async function parseAndInsert(raw: string): Promise<void> {
  const lines = raw.trim().split(/\r?\n/);

  const usersMap: Record<string, any> = {};

  for (const line of lines) {
    const { userId, userName, orderId, productId, value, date } = parseLine(line);

    if (!usersMap[userId]) {
      usersMap[userId] = {
        user_id: userId,
        name: userName.trim(),
        orders: {},
      };
    }

    const user = usersMap[userId];
    if (!user.orders[orderId]) {
      user.orders[orderId] = {
        order_id: orderId,
        date: toISODate(date),
        total: 0,
        products: [],
      };
    }

    user.orders[orderId].products.push({ product_id: productId, value });
    user.orders[orderId].total += value;
  }

  const docs = Object.values(usersMap).map((user: any) => ({
    ...user,
    orders: Object.values(user.orders),
  }));

  await insertOrders(docs); // ✅ nova chamada ao repositório
}
