import dotenv from "dotenv";
import app from "./app";
import { connectToMongo } from "./configs/mongoClient";

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToMongo();
        app.listen(port, () => {
            console.log(`Server running on port:${port}`);
        });
    } catch (error) {
        console.error("error starting server", error);
        process.exit(1);
    }
}

startServer();
