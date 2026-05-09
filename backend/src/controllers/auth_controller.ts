import { Collection } from "mongodb";
import type { LoginBody, UserSchema } from "../types/types.ts";

export class MongoAuthController {
  private collection;

  constructor(db: Collection<UserSchema>) {
    this.collection = db;
  }

  async login(body: LoginBody) {
    const presentUser = await this.collection.findOne({
      email: body.email,
    });

    if (presentUser) {
      if (body.password === presentUser.password) {
        return presentUser;
      } else {
        throw new Error("Password is not matched");
      }
    }

    const { insertedId } = await this.collection.insertOne(body);
    return await this.collection.findOne({ _id: insertedId });
  }
}
