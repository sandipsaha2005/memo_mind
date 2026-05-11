import { Context } from "hono";
import { NotebookController } from "../../controllers/notebook_controller.ts";
import { ObjectId } from "mongodb";

export const createNotebookHandler = async (c: Context) => {
  const controller: NotebookController = c.get("noteBookController");
  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const body = await c.req.json();
    const payload = { ...body, userId: new ObjectId(jwtPayload?.id) };
    const notebookId = await controller.createNotebook(payload)!;

    return c.json({
      success: true,
      message: "Notebook created successfully",
      data: notebookId,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};

export const getAllNotebooksHandler = async (c: Context) => {
  const controller: NotebookController = c.get("noteBookController");
  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const notebooks = await controller.getAllNotebook(jwtPayload.id);

    return c.json({
      success: true,
      message: "Notebooks fetched successfully",
      data: notebooks,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};

export const getNotebookHandler = async (c: Context) => {
  const controller: NotebookController = c.get("noteBookController");

  try {
    const id = c.req.param("id")!;
    const notebook = await controller.getNoteBook(id);

    return c.json({
      success: true,
      message: "Notebook fetched successfully",
      data: notebook,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};

export const deleteNotebookHandler = async (c: Context) => {
  const controller: NotebookController = c.get("noteBookController");

  try {
    const id = c.req.param("id")!;
    const notebook = await controller.deleteNoteBook(id);

    return c.json({
      success: true,
      message: "Notebook deleted successfully",
      data: notebook,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};
