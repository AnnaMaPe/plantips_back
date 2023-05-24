import type * as core from "express-serve-static-core";
import { type Request } from "express";

export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterUserCredentials extends UserCredentials {
  email: string;
}

export interface UserRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any
> extends Request<P, ResBody, ReqBody> {
  id: string;
  sharedBy: string;
}
