import { Request, Response } from "express";
import { getOrders } from "../services/orderService";
import { enqueueFile } from "../services/queueService";
import { QueryFilters } from "../types/query.ds";

export async function handleUpload(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file || !file.buffer) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const raw = file.buffer.toString("utf-8");

    if (!raw.trim()) {
      return res.status(400).json({ error: "Arquivo está vazio." });
    }

    await enqueueFile(raw);
    return res.status(201).json({ message: "Arquivo enfileirado com sucesso." });
  } catch (e) {
    console.error("❌ Erro no upload:", e);
    return res.status(500).json({ error: "Erro ao enfileirar o arquivo." });
  }
}

export async function handleGetOrders(req: Request, res: Response) {
  try {
    const { orderId, startDate, endDate }: QueryFilters = req.query;

    const orders = await getOrders({ orderId, startDate, endDate });

    return res.json(orders);
  } catch (e) {
    console.error("❌ Erro ao buscar pedidos:", e);
    return res.status(500).json({ error: "Erro ao consultar pedidos." });
  }
}
