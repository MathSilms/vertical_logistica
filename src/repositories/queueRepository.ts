import { getCollection } from "../configs/mongoClient";
import type { QueueTask } from "../types/queue";
import { ObjectId } from "mongodb";



export async function getNextPendingTask(): Promise<QueueTask | null> {

    const queue = getCollection<QueueTask>("queue_tasks");
    const result = await queue.findOneAndUpdate(
        { status: "pending" },
        {
            $set: {
                status: "processing",
                updatedAt: new Date(),
            },
        },
        { sort: { createdAt: 1 }, returnDocument: "after" }
    );

    return result || null;
}

export async function markTaskAsDone(_id: ObjectId): Promise<void> {
    const queue = getCollection<QueueTask>("queue_tasks");
    await queue.updateOne(
        { _id },
        { $set: { status: "done", updatedAt: new Date() } }
    );
}

export async function markTaskAsError(_id: ObjectId): Promise<void> {
    const queue = getCollection<QueueTask>("queue_tasks");
    await queue.updateOne(
        { _id },
        { $set: { status: "error", updatedAt: new Date() } }
    );
}

export async function insertQueueTask(raw: string) {
    const queue = getCollection<QueueTask>("queue_tasks");

    if (!raw || typeof raw !== "string") {
        throw new Error("Conteúdo inválido.");
    }
    
    const task: QueueTask = {
        raw,
        status: "pending",
        createdAt: new Date(),
        updatedAt: null,
    };

    await queue.insertOne(task);
}