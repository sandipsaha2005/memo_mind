import { Hono } from "hono";
import {
  addInteractionHandler,
  createNotebookHandler,
  getAllNotebooksHandler,
  getNoteBookHandler,
} from "../handlers/notebook_handlers.ts";

const notebookRouter = new Hono();

notebookRouter.post("/create", createNotebookHandler);
notebookRouter.get("/get-all", getAllNotebooksHandler);
notebookRouter.put("/add-interaction", addInteractionHandler);
notebookRouter.get("/get/:id", getNoteBookHandler);

export default notebookRouter;
