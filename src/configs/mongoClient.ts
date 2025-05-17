import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db: Db;

export async function connectToMongo() {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();
  db = client.db();
  console.log("✅ MongoDB conectado com sucesso");
}

export function getDb(): Db {
  if (!db) throw new Error("MongoDB ainda não está conectado.");
  return db;
}

export function getCollection<T extends Document = Document>(name: string): Collection<T> {
  return getDb().collection(name);
}
