import { getCollection } from "./mongoClient";

export async function setupIndexes() {
    const collection = getCollection("orders");
    await collection.createIndex({ "orders.order_id": 1 });
    await collection.createIndex({ "orders.date": 1 });

    const queue = getCollection("queue_tasks");
    await queue.createIndex({ status: 1 });
    await queue.createIndex({ createdAt: 1 });


    console.log("✅ Índices criados");
}
