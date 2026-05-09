import { Context } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { MongoAuthController } from "../controllers/auth_controller.ts";

export const loginHandler = async (c: Context) => {
  const authController: MongoAuthController = c.get("authController");
  try {
    const body = await c.req.json();
    const user = await authController.login(body)!;

    const token = await sign(
      { id: user?._id, email: user?.email },
      Deno.env.get("JWT_SECRET")!,
      "HS256",
    );

    setCookie(c, "token", token);
    return c.json({ success: true, message: "logged in successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ success: false, message: error.message });
    }

    console.log(error);
    return c.json({ success: false }, 500);
  }
};
