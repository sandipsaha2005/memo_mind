import { OpenRouter } from "@openrouter/sdk";

export const openRouterClient = new OpenRouter({
  apiKey: Deno.env.get("OPEN_ROUTER_API_KEY"),
});