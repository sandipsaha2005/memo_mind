import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import type { JwtVariables } from "hono/jwt";
import {
  embeddingIngestionHandler,
  embeddingRetrievalHandler,
} from "./handlers/query_handlers.ts";
import { Collection } from "chromadb";
import { loginHandler } from "./handlers/auth_handlers.ts";
import { MongoAuthController } from "./controllers/auth_controller.ts";
import { MongoNotebookController } from "./controllers/notebook_controller.ts";
import { jwt } from "hono/jwt";
import notebookRouter from "./notes/notebook_router.ts";

export const createApp = (
  ragCollection: Collection,
  authController: MongoAuthController,
  noteBookController: MongoNotebookController,
) => {
  const app = new Hono<{ Variables: JwtVariables }>();

  app.use(
    "*",
    cors({
      origin: "http://localhost:5173",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
    }),
  );

  app.use(
    "/api/*",
    jwt({
      secret: Deno.env.get("JWT_SECRET")!,
      alg: "HS256",
      cookie: "token",
    }),
  );

  app.use("*", (c: Context, next) => {
    c.set("ragCollection", ragCollection);
    c.set("authController", authController);
    c.set("noteBookController", noteBookController);
    return next();
  });

  app.post("/login", loginHandler);
  app.post("/api/ingest", embeddingIngestionHandler);
  app.post("/api/retrieve", embeddingRetrievalHandler);
  app.route("/api/notebook", notebookRouter);

  return app;
};
