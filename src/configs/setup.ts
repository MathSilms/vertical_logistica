import { getCollection } from "./mongoClient";

export async function setupIndexes() {
  const collection = getCollection("orders");

  await collection.createIndex({ "orders.order_id": 1 });
  await collection.createIndex({ "orders.date": 1 });

  console.log("✅ Índices criados");
}
