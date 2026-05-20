import { Context } from "hono";
import { PdfReader } from "pdfreader";
import { AppError } from "../../shared/errors/error.ts";
import { RequestBody } from "../../shared/types/types.ts";
import { NotebookController } from "../../controllers/notebook_controller.ts";
import { generateResponse } from "../../services/rag/response_generator.ts";
import { RetrievalController } from "../../controllers/retrieval_controller.ts";
import { IngestionController } from "../../controllers/ingestion_controller.ts";
import { Buffer } from "node:buffer";

export const ingestionHandler = async (c: Context) => {
  const ingestionController: IngestionController = c.get("ingestionController");
  const jwtPayload = c.get("jwtPayload") as { id: string };
  const controller: NotebookController = c.get("noteBookController");

  try {
    const body = await c.req.formData();

    const payload = {
      text: body.get("text") as string,
      notebookId: body.get("notebookId") as string,
      userId: jwtPayload.id!,
    };

    const file = body.get("file");

    if (file instanceof File) {
      const arrayBugger = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBugger);
      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) console.log(err);
        else if (!item) console.log("Item is empty");
        else if (item) console.log(item.text);
      });
    }

    ingestionController.ingest(payload);

    await controller.updateNotebook(body?.get("notebookId") as string);
    return c.json({
      success: true,
      message: "Embeddings generated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return c.json(
        { success: false, message: error.message },
        400,
      );
    }
    console.log(error);
    return c.json(
      { success: false, message: "Something went wrong" },
      500,
    );
  }
};

export const retrievalHandler = async (c: Context) => {
  const retrievalController: RetrievalController = c.get("retrievalController");
  const controller: NotebookController = c.get("noteBookController");
  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const body: RequestBody = await c.req.json();

    await controller.addInteraction({
      type: "query",
      content: body.text,
      timestamp: new Date(),
      notebookId: body.notebookId,
    });

    const chunks = await retrievalController.retrieve(body, jwtPayload.id);

    const { interactions } = await controller.getNoteBook(
      body.notebookId,
    );

    const content = await generateResponse(
      body.text,
      chunks,
      interactions,
    );

    await controller.addInteraction({
      type: "response",
      content: content.content,
      timestamp: new Date(),
      notebookId: body.notebookId,
    });

    return c.json({
      success: true,
      message: "Successfully returned Response",
      content: content.content,
      query: body.text,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(
        { success: false, message: error.message },
        400,
      );
    }
    console.log(error);

    return c.json(
      { success: false, message: "Something went wrong" },
      500,
    );
  }
};
