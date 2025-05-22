import { Router } from "express";
import ordersRoutes from "./ordersRoutes";

const router = Router();

router.use("/orders", ordersRoutes);

export default router;