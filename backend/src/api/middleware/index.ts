import { corsMiddleware } from "./cors.ts";
import { jwtMiddleware } from "./jwt.ts";

const middlewares = {
  cors: corsMiddleware,
  jwt: jwtMiddleware,
};

export default middlewares;
