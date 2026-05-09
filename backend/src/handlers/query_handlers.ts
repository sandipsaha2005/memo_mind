import { Context } from "hono";
import { generate, tokenize } from "../core/embeddings_generator.ts";
import { AppError } from "../errors/error.ts";
import { RequestBody } from "../types/types.ts";
import { Collection } from "chromadb";
import { MongoNotebookController } from "../controllers/notebook_controller.ts";
import {
  generateResponse,
  generateResponseUsingOllama,
  generateResponseUsingOpenRouter,
} from "../core/response_generator.ts";

export const embeddingIngestionHandler = async (c: Context) => {
  const ragCollection: Collection = c.get("ragCollection");
  const jwtPayload = c.get("jwtPayload") as { id: string };
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );

  try {
    const body = await c.req.formData();
    const tokenized = tokenize(body.get("text") as string);
    const chunks = await generate(tokenized);

    await ragCollection.add({
      ids: chunks.map((_, i) => `${10}_${10}_${Date.now()}_${i}`),
      embeddings: chunks.map(({ embedding }) => embedding),
      documents: chunks.map(({ text }) => text),
      metadatas: chunks.map(() => ({
        userId: jwtPayload.id,
        chatId: body.get("notebookId") as string,
        timestamp: Date.now(),
      })),
    });

    await noteBookController.updateNotebook(body?.get("notebookId") as string);
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

export const embeddingRetrievalHandler = async (c: Context) => {
  const ragCollection: Collection = c.get("ragCollection");
  const noteBookController: MongoNotebookController = c.get(
    "noteBookController",
  );
  const jwtPayload = c.get("jwtPayload") as { id: string };

  try {
    const body: RequestBody = await c.req.json();
    const tokenizedQuery = tokenize(body.text);
    const queryEmbeddings = await generate(tokenizedQuery);

    await noteBookController.addInteraction({
      type: "query",
      content: body.text,
      timestamp: new Date(),
      notebookId: body.notebookId,
    });

    const results = await ragCollection.query({
      queryEmbeddings: queryEmbeddings.map(({ embedding }) => embedding),
      nResults: 10,
      where: {
        $and: [
          { userId: { $eq: jwtPayload.id } },
          { chatId: { $eq: body.notebookId } },
        ],
      },
      include: ["documents", "metadatas", "distances"],
    });

    const content = await generateResponseUsingOpenRouter(
      body.text,
      results.documents[0] as string[],
    );

    await noteBookController.addInteraction({
      type: "response",
      content: content.content,
      timestamp: new Date(),
      notebookId: body.notebookId,
    });

    return c.json({
      success: true,
      message: "Matching statements",
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
