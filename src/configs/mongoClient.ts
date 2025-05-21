import { MongoClient, Db, Collection, Document } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db: Db;

export async function connectToMongo() {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();
  db = client.db();
  console.log("✅ MongoDB conected");
}

export function getDb(): Db {
  if (!db) throw new Error("MongoDB not conected.");
  return db;
}

export function getCollection<T extends Document = Document>(name: string): Collection<T> {
  return getDb().collection(name);
}
