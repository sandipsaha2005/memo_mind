import { Db, MongoClient } from "mongodb";

const client = new MongoClient(Deno.env.get("MONGO_URL")!);

let db: Db;

export const getDB = async () => {
  if (!db) {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("memo_mind");
  }
  return db;
};
