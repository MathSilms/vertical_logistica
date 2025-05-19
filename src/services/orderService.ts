import { Db } from "mongodb";

interface QueryFilters {
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getOrders(db: Db, filters: QueryFilters) {
  const pipeline: any[] = [];

  if (filters.orderId) {
    pipeline.push({
      $match: { "orders.order_id": Number(filters.orderId) },
    });
  }

  if (filters.startDate || filters.endDate) {
    const dateFilter: any = {};
    if (filters.startDate) dateFilter.$gte = filters.startDate;
    if (filters.endDate) dateFilter.$lte = filters.endDate;

    pipeline.push({
      $match: { "orders.date": dateFilter },
    });
  }

  return db.collection("orders").aggregate(pipeline).toArray();
}