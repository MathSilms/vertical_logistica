import dotenv from "dotenv";
import app from "./app";
import { connectToMongo } from "./configs/mongoClient";
import { setupIndexes } from "./configs/setup";
import { startOrderProcessWorker } from "./workers/orderProcessWorker";

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToMongo();
        await setupIndexes();
        startOrderProcessWorker();

        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("❌ error starting server:", error);
        process.exit(1);
    }
}

startServer();
