import { Router, Request, Response } from "express";
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


export default router;