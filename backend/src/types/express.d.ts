import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../modules/Users/user.model.js";

declare global {
  namespace Express {
    interface User extends Partial<IUser>, Partial<JwtPayload> {
      id?: string;
      userId?: string;
      username?: string;
      role?: "User" | "Admin" | "SuperAdmin" | string;
      email?: string;
      [key: string]: any;
    }
  }
}

export {};
