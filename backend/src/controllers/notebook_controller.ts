import { Collection, ObjectId, WithId } from "mongodb";
import type { Interaction, Notebook, Source } from "../shared/types/types.ts";

export class NotebookController {
  private notebookCollection;
  private interactionCollection;

  constructor(
    db: Collection<Notebook>,
    interactionDb: Collection<Interaction>,
  ) {
    this.notebookCollection = db;
    this.interactionCollection = interactionDb;
  }

  async updateNotebook(notebookId: string) {
    await this.notebookCollection.updateOne(
      { _id: new ObjectId(notebookId) },
      [
        {
          $set: {
            isInitialIngestDone: {
              $cond: [
                { $eq: ["$isInitialIngestDone", false] },
                true,
                "$isInitialIngestDone",
              ],
            },
            ingestCount: {
              $cond: [
                { $eq: ["$isInitialIngestDone", true] },
                "$ingestCount",
                { $add: ["$ingestCount", 1] },
              ],
            },
          },
        },
      ],
    );
  }

  async createNotebook(body: { name: string; userId: ObjectId }) {
    const payload = {
      ...body,
      timestamp: new Date(),
      isInitialIngestDone: false,
      ingestCount: 0,
      interactions: [],
      sources: [],
    };
    const { insertedId } = await this.notebookCollection.insertOne(payload);
    return insertedId;
  }

  async addSource(notebookId: string, source: Source) {
    await this.notebookCollection.updateOne(
      { _id: new ObjectId(notebookId) },
      { $push: { sources: source } },
    );
  }

  getAllNotebook(id: string) {
    const userId = new ObjectId(id);
    return this.notebookCollection.find({ userId }).toArray();
  }

  async addInteraction(body: Interaction) {
    await this.interactionCollection.insertOne(
      {
        content: body.content,
        timestamp: body.timestamp,
        type: body.type,
        notebookId: body.notebookId,
      },
    );
  }

  async getNoteBook(notebookId: string) {
    const notebook = await this.notebookCollection.findOne({
      _id: new ObjectId(notebookId),
    });

    const interactions = await this.interactionCollection.find({
      notebookId: notebookId,
    }).toArray();

    return {
      interactions,
      initialIngestDone: notebook?.isInitialIngestDone,
      sources: notebook?.sources ?? [],
    };
  }

  async deleteNoteBook(notebookId: string) {
    const deleted: WithId<Notebook> | null = await this.notebookCollection
      .findOneAndDelete({
        _id: new ObjectId(notebookId),
      });

    await this.interactionCollection.deleteMany({
      notebookId: notebookId,
    });

    return deleted;
  }
}
