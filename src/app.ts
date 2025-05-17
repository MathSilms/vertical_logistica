import express from "express";
import dotenv from "dotenv";
import { json } from "body-parser";
import { connectToMongo, getDb } from "./configs/mongoClient";
// import ordersRouter from "./controllers/ordersController";

dotenv.config();

const app = express();
app.use(json({ limit: "10mb" }));

// app.use("/orders", ordersRouter);

const port = process.env.PORT || 3000;

async function start() {
    await connectToMongo();
    app.locals.db = getDb();

    app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
}

start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});