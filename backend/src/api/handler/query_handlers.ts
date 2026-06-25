import { Context } from "hono";
import { AppError, BadRequestError } from "../../shared/errors/error.ts";
import { RequestBody } from "../../shared/types/types.ts";
import { NotebookController } from "../../controllers/notebook_controller.ts";
import { generateResponseStream } from "../../services/rag/response_generator.ts";
import { streamSSE } from "hono/streaming";
import { RetrievalController } from "../../controllers/retrieval_controller.ts";
import { IngestionController } from "../../controllers/ingestion_controller.ts";


export const ingestionHandler = async (c: Context) => {
  const ingestionController: IngestionController = c.get("ingestionController");
  const jwtPayload = c.get("jwtPayload") as { id: string };
  const controller: NotebookController = c.get("noteBookController");

  try {
    const body = await c.req.formData();

    const notebookId = body.get("notebookId") as string;
    const file = body.get("file") as File | null;
    const sourceName = (body.get("sourceName") as string | null)?.trim();
    let text: string;
    let source: { name: string; type: "file" | "text" };

    if (file) {
      const isTextFile = file.type === "text/plain" || file.name.endsWith(".txt");
      if (!isTextFile) {
        throw new BadRequestError("Only .txt files are allowed");
      }
      text = await file.text();
      if (!text.trim()) {
        throw new BadRequestError("Empty files are not allowed");
      }
      source = { name: sourceName || file.name, type: "file" };
    } else {
      const rawText = body.get("text") as string;
      if (!rawText?.trim()) {
        throw new BadRequestError("Text input cannot be empty");
      }
      text = rawText;
      source = { name: sourceName || "Untitled text", type: "text" };
    }

    const payload = {
      text,
      notebookId,
      userId: jwtPayload.id!,
    };

    await ingestionController.ingest(payload);

    await controller.updateNotebook(notebookId);
    await controller.addSource(notebookId, source);
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
    const { interactions } = await controller.getNoteBook(body.notebookId);
    const eventStream = await generateResponseStream(
      body.text,
      chunks,
      interactions,
    );

    return streamSSE(c, async (stream) => {
      let fullContent = "";

      for await (const chunk of eventStream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          await stream.writeSSE({ event: "content", data: delta });
        }
      }

      await controller.addInteraction({
        type: "response",
        content: fullContent,
        timestamp: new Date(),
        notebookId: body.notebookId,
      });

      await stream.writeSSE({
        event: "done",
        data: JSON.stringify({ success: true, query: body.text }),
      });
    }, async (err, stream) => {
      console.log(err);
      await stream.writeSSE({ event: "error", data: err.message });
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
