export interface Notebook {
  _id: string;
  name: string;
  timestamp: string;
}

export interface Message {
  type: "query" | "response";
  content: string;
}

export interface Source {
  id: string;
  name: string;
  type: "file" | "text";
  pending?: boolean;
}

export interface NotebookDetail {
  sources: Source[];
  interactions: Message[];
  initialIngestDone: boolean;
}
