import { getCollection } from "../configs/mongoClient";
import { QueryFilters } from "../types/query.ds";

export async function insertOrders(docs: any[]) {
  const collection = getCollection("orders");
  await collection.deleteMany({});
  await collection.insertMany(docs);
}


export async function findOrdersWithFilters(filters: QueryFilters) {
  const collection = getCollection("orders");
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

  return collection.aggregate(pipeline).toArray();
}
