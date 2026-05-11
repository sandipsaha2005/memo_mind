import { Hono } from "hono";
import {
  createNotebookHandler,
  deleteNotebookHandler,
  getAllNotebooksHandler,
  getNotebookHandler,
} from "../handler/notebook_handlers.ts";

const notebookRouter = new Hono();

notebookRouter.post("/create", createNotebookHandler);
notebookRouter.get("/get-all", getAllNotebooksHandler);
notebookRouter.get("/get/:id", getNotebookHandler);
notebookRouter.get("/delete/:id", deleteNotebookHandler);

export default notebookRouter;
