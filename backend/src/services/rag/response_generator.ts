import { WithId } from "mongodb";
import { openRouterClient } from "../../infra/clients/open_router.ts";
import { Interaction } from "../../shared/types/types.ts";
import { ChatMessages } from "@openrouter/sdk/models";

export const generateResponseUsingOllama = async (
  question: string,
  chunks: string[],
) => {
  const context = chunks.join("\n\n");

  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      stream: false,

      messages: [
        {
          role: "system",
          content: `Answer the user's question using only the context below.
                    If the answer is not in the context, say "I don't know".
                    
                    Context:
                    ${context}`,
        },
        { role: "user", content: question },
      ],
    }),
  });

  const data = await res.json();
  return data.message.content;
};

export const generateResponse = async (
  question: string,
  chunks: string[],
  interactions: WithId<Interaction>[],
) => {
  const chatHistory: ChatMessages[] = interactions
    .slice(-10)
    .map(({ type, content }) => ({
      role: type === "query" ? "user" : "assistant",
      content: content,
    }));

  const completion = await openRouterClient.chat.send({
    chatRequest: {
      maxTokens: 1000,
      model: "google/gemma-4-26b-a4b-it",
      messages: [
        {
          role: "system",
          content: `Answer the user's question using only the context below.
                    If the answer is not in the context, say "I don't know".
                    
                    Context:
                    ${chunks.join("\n\n")}`,
        },
        ...chatHistory,
        {
          role: "user",
          content: question,
        },
      ],
    },
  });

  return completion.choices[0].message;
};
