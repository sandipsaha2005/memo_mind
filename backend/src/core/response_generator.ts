import { openRouterClient } from "../lib/open_router_config.ts";

export const generateResponse = async (question: string, chunks: string[]) => {
  const context = chunks.join("\n\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
      Deno.env.get("GEMINI_API_KEY2")
    }`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `Answer the user's question using only the context below.
                   If the answer is not in the context, say "I don't know".
                   
                   Context:
                   ${context}`,
          }],
        },
        contents: [{
          parts: [{ text: question }],
        }],
      }),
    },
  );

  const data = await res.json();
  console.log(data);

  return data.candidates[0].content.parts[0].text;
};

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

export const generateResponseUsingOpenRouter = async (
  question: string,
  chunks: string[],
) => {
  const completion = await openRouterClient.chat.send({
    chatRequest: {
      maxTokens: 1000, // increase this, 100 is too low for RAG responses
      model: "google/gemma-4-26b-a4b-it",
      messages: [
        {
          role: "system",
          content: `Answer the user's question using only the context below.
                    If the answer is not in the context, say "I don't know".
                    
                    Context:
                    ${chunks.join("\n\n")}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    },
  });

  return completion.choices[0].message;
};
