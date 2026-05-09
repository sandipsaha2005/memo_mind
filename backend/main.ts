import { Collection, Db } from "mongodb";
import { createApp } from "./src/app.ts";
import { rabCollection } from "./src/db/db.ts";
import { getDB } from "./src/db/mongo.ts";
import { Interaction, Notebook, UserSchema } from "./src/types/types.ts";
import { MongoAuthController } from "./src/controllers/auth_controller.ts";
import { MongoNotebookController } from "./src/controllers/notebook_controller.ts";

const main = async () => {
  const db: Db = await getDB();
  const userCollection: Collection<UserSchema> = db.collection("users");
  const notebookCollection: Collection<Notebook> = db.collection("notebooks");
  const interactionCollection: Collection<Interaction> = db.collection(
    "interaction",
  );

  const authController = new MongoAuthController(userCollection);
  const noteBookController = new MongoNotebookController(
    notebookCollection,
    interactionCollection,
  );

  const app = createApp(rabCollection, authController, noteBookController);
  Deno.serve({ port: 9999, hostname: "0.0.0.0" }, app.fetch);
};

main();
