import express from "express";
import { json } from "body-parser";
// import ordersRouter from "./controllers/ordersController";

const app = express();

app.use(json({ limit: "10mb" }));
// app.use("/orders", ordersRouter);

export default app;
