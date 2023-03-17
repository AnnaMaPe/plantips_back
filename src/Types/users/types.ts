import { type Request } from "express";

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRequest extends Request {
  sharedBy: string;
  id: string;
}
