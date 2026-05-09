import { Context } from "hono";
import { MongoNotebookController } from "../controllers/notebook_controller.ts";
import { ObjectId } from "mongodb";

export const createNotebookHandler = async (c: Context) => {
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );

  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const body = await c.req.json();
    const payload = { ...body, userId:new ObjectId(jwtPayload?.id) };
    const notebookId = await noteBookController.createNotebook(payload)!;

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
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );
  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const notebookId = await noteBookController.getAllNotebook(jwtPayload.id);

    return c.json({
      success: true,
      message: "Notebooks fetched successfully",
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

export const addInteractionHandler = async (c: Context) => {
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );

  try {
    const payload = await c.req.json();
    await noteBookController.addInteraction(payload);

    return c.json({
      success: true,
      message: "Interaction successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};

export const getNoteBookHandler = async (c: Context) => {
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );

  try {
    const id = c.req.param("id")!;
    const notebook = await noteBookController.getNoteBook(id);

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
