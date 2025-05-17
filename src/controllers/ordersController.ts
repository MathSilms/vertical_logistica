import { Router, Request, Response } from "express";
import { parseAndInsert } from "../services/transformService";
import { queryOrders } from "../services/queryService";
import { enqueueFileProcess } from "../queue/fileQueue";

const router = Router();

// Upload endpoint – expects raw text file in body (simplificado)
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const raw = req.body.file ?? "";
    await enqueueFileProcess(raw);
    res.status(201).json({ message: "Arquivo enfileirado com sucesso." });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// GET /orders with optional filters: order_id, start_date, end_date
router.get("/", async (req: Request, res: Response) => {
  const { order_id, start_date, end_date } = req.query;
  
  const data = await queryOrders(req.app.locals.db, {
    orderId: order_id as string | undefined,
    startDate: start_date as string | undefined,
    endDate: end_date as string | undefined,
  });
  res.json(data);
});

export default router;