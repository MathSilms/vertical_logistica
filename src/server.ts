import dotenv from "dotenv";
import app from "./app";
import { connectToMongo } from "./configs/mongoClient";

dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToMongo();
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
