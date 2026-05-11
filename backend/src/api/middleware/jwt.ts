import { jwt } from "hono/jwt";

export const jwtMiddleware = jwt({
  secret: Deno.env.get("JWT_SECRET")!,
  alg: "HS256",
  cookie: "token",
});
