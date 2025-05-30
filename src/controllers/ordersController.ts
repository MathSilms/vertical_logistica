import { Request, Response } from "express";
import { getOrders } from "../services/orderService";
import { enqueueFile } from "../services/queueService";
import { QueryFilters } from "../types/query.d";

export async function handleUpload(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file || !file.buffer) {
      return res.status(400).json({ error: "No file provided." });
    }

    const raw = file.buffer.toString("utf-8");

    if (!raw.trim()) {
      return res.status(400).json({ error: "File is empty." });
    }

    await enqueueFile(raw);
    return res.status(201).json({ message: "File successfully enqueued." });
  } catch (e) {
    console.error("Erro no upload:", e);
    return res.status(500).json({ error: "Error enqueuing the file." });
  }
}

export async function handleGetOrders(req: Request, res: Response) {
  try {
    const { orderId, startDate, endDate }: QueryFilters = req.query;

    const orders = await getOrders({ orderId, startDate, endDate });

    return res.json(orders);
  } catch (e) {
    console.error("Error fetching orders:", e);
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: "Error fetching orders", message });
  }
}
