import "@std/dotenv/load";
import { Context, Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import notebookRouter from "./api/routes/notebook_router.ts";

import {
  ingestionHandler,
  retrievalHandler,
} from "./api/handler/query_handlers.ts";
import { Collection } from "chromadb";
import { loginHandler } from "./api/handler/auth_handlers.ts";
import { MongoAuthController } from "./controllers/auth_controller.ts";
import { NotebookController } from "./controllers/notebook_controller.ts";
import { corsMiddleware } from "./api/middleware/cors.ts";
import { jwtMiddleware } from "./api/middleware/jwt.ts";
import { RetrievalController } from "./controllers/retrieval_controller.ts";
import { IngestionController } from "./controllers/ingestion_controller.ts";

export const createApp = (
  retrievalController: RetrievalController,
  ingestionController: IngestionController,
  authController: MongoAuthController,
  noteBookController: NotebookController,
) => {
  const app = new Hono<{ Variables: JwtVariables }>();

  app.use("*", corsMiddleware);
  app.use("/api/*", jwtMiddleware);

  app.use("*", (c: Context, next) => {
    c.set("authController", authController);
    c.set("noteBookController", noteBookController);
    return next();
  });

  app.use("/api/*", (c: Context, next) => {
    c.set("retrievalController", retrievalController);
    c.set("ingestionController", ingestionController);
    return next();
  });

  app.post("/login", loginHandler);
  app.post("/api/ingest", ingestionHandler);
  app.post("/api/retrieve", retrievalHandler);
  app.route("/api/notebook", notebookRouter);

  return app;
};
