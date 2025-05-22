import { getCollection } from "../configs/mongoClient";
import { QueryFilters } from "../types/query.d";

export async function insertOrders(docs: any[]) {
  const collection = getCollection("orders");
  await collection.deleteMany({});
  await collection.insertMany(docs);
}


export async function findOrdersWithFilters(filters: QueryFilters) {
  const collection = getCollection("orders");

  const matchConditions: any = {};
  const filterConditions: any[] = [];

  // Filtro por orderId
  if (filters.orderId) {
    const orderId = Number(filters.orderId);
    matchConditions.orders = {
      ...(matchConditions.orders || {}),
      $elemMatch: {
        ...(matchConditions.orders?.$elemMatch || {}),
        order_id: orderId
      }
    };
    filterConditions.push({ $eq: ["$$order.order_id", orderId] });
  }

  // Filtro por startDate e endDate
  if (filters.startDate || filters.endDate) {
    const dateMatch: any = {};
    const dateFilter: any[] = [];

    if (filters.startDate) {
      dateMatch.$gte = filters.startDate;
      dateFilter.push({ $gte: ["$$order.date", filters.startDate] });
    }

    if (filters.endDate) {
      dateMatch.$lte = filters.endDate;
      dateFilter.push({ $lte: ["$$order.date", filters.endDate] });
    }

    matchConditions.orders = {
      ...(matchConditions.orders || {}),
      $elemMatch: {
        ...(matchConditions.orders?.$elemMatch || {}),
        date: dateMatch
      }
    };

    filterConditions.push(...dateFilter);
  }

  const pipeline: any[] = [];

  // 1. $match inicial para performance
  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // 2. $project com $filter no array de pedidos
  pipeline.push({
    $project: {
      _id: 1,
      user_id: 1,
      name: 1,
      orders: {
        $filter: {
          input: "$orders",
          as: "order",
          cond: filterConditions.length > 0 ? { $and: filterConditions } : {}
        }
      }
    }
  });

  // 3. $match final para remover arrays vazias
  pipeline.push({
    $match: {
      "orders.0": { $exists: true }
    }
  });

  return collection.aggregate(pipeline).toArray();
}
