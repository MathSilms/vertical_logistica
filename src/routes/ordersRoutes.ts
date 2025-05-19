// src/routes/ordersRoutes.ts
import { Router } from "express";
import multer from "multer";
import { handleUpload, handleGetOrders } from "../controllers/ordersController";

const router = Router();
const upload = multer();

router.post("/upload", upload.single("file"), handleUpload);
router.get("/", handleGetOrders);

export default router;
