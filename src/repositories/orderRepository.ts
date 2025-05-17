import { getCollection } from "../configs/mongoClient";

export async function insertOrders(docs: any[]) {
  const collection = getCollection("orders");
  await collection.deleteMany({});
  await collection.insertMany(docs);
}


export async function findOrdersWithFilters(filters: any) {
  const collection = getCollection("orders");
  return collection.aggregate(filters).toArray();
}
