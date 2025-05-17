import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db: Db;

export async function connectToMongo() {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();
  db = client.db();
  console.log("✅ MongoDB conectado");
}

export function getDb(): Db {
  if (!db) throw new Error("MongoDB não conectado ainda.");
  return db;
}
