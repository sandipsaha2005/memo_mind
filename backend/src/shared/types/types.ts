import { ObjectId } from "mongodb";

export type UserSchema = {
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

type Query = {
  query: string;
  timestamp: Date;
};

type Response = {
  response: string;
  timestamp: Date;
};

export type Interaction = {
  type: "query" | "response";
  content: string;
  timestamp: Date;
  notebookId: string;
};

export type Source = {
  name: string;
  type: "file" | "text";
};

export type Notebook = {
  name: string;
  userId: ObjectId;
  isInitialIngestDone: boolean;
  ingestCount: number;
  interactions: Interaction[];
  sources: Source[];
  timestamp: Date;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export type ErrorResponse = {
  success: false;
  message: string;
};

export type RequestBody = {
  text: string;
  notebookId: string;
};

export type Chunk = {
  text: string;
  id: number;
  embedding: number[];
};

export type Memory = {
  embeddings: Chunk[];
};

export type RetrievedChunks = {
  similarity: number;
  text: string;
};

export type EvaluationResult =
  | { sufficient: true }
  | { sufficient: false; followUpQuery: string[] };
