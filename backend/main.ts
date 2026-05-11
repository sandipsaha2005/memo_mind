import { Collection, Db } from "mongodb";
import { createApp } from "./src/app.ts";
import { documents } from "./src/infra/database/chrom_db.ts";
import { getDB } from "./src/infra/database/mongo_db.ts";
import { Interaction, Notebook, UserSchema } from "./src/shared/types/types.ts";
import { MongoAuthController } from "./src/controllers/auth_controller.ts";
import { NotebookController } from "./src/controllers/notebook_controller.ts";
import { RetrievalController } from "./src/controllers/retrieval_controller.ts";
import { IngestionController } from "./src/controllers/ingestion_controller.ts";

const main = async () => {
  const db: Db = await getDB();
  const userCollection: Collection<UserSchema> = db.collection("users");
  const notebookCollection: Collection<Notebook> = db.collection("notebooks");
  const interactionCollection: Collection<Interaction> = db.collection(
    "interaction",
  );

  const authController = new MongoAuthController(userCollection);
  const noteBookController = new NotebookController(
    notebookCollection,
    interactionCollection,
  );

  const retrievalController = new RetrievalController(documents);
  const ingestionController = new IngestionController(documents);

  const app = createApp(
    retrievalController,
    ingestionController,
    authController,
    noteBookController,
  );
  Deno.serve({ port: 9999, hostname: "0.0.0.0" }, app.fetch);
};

main();
