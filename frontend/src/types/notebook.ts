export interface Notebook {
  _id: string;
  name: string;
  timestamp: string;
}

export interface Message {
  type: "query" | "response";
  content: string;
}
