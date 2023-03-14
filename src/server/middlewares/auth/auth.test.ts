import { type Response, type NextFunction, type Request } from "express";
import { CustomError } from "../../../CustomError/CustomError";
import { type UserRequest } from "../../../Types/users/types";
import jwt from "jsonwebtoken";
import { auth } from "./auth";
import mongoose, { Mongoose } from "mongoose";

const req: Partial<Request> = {};

const next: NextFunction = jest.fn();
const res: Partial<Response> = {};

describe("Given an auth middleware", () => {
  describe("When it receives a request without an authorization header", () => {
    test("Then it should call the method next with an error and the message 'Missing authorization header'", () => {
      const req: Partial<UserRequest> = {
        header: jest.fn().mockReturnValue(undefined),
      };
      const expectedError = new CustomError(
        "Missing authorization header",
        401,
        "Invalid token"
      );

      jwt.verify = jest.fn().mockReturnValueOnce({});
      auth(req as UserRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When it receives a request and the authorization header does not contains 'Bearer'", () => {
    test("Then it should call the method next with an error and the message 'Missing bearer in authorization header'", () => {
      const req: Partial<UserRequest> = {
        header: jest.fn().mockReturnValue("123456"),
      };
      const expectedError = new CustomError(
        "Missing bearer in authorization header",
        401,
        "Invalid token"
      );

      jwt.verify = jest.fn().mockReturnValueOnce({});
      auth(req as UserRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
  describe("When it receives a request with an authoriratizon header that contains 'Bearer 243534656768urthdy3dg'", () => {
    test("Then it should add the property sharedBy and the token to the request and call its next method", () => {
      const req: Partial<Request> = {};
      req.header = jest
        .fn()
        .mockReturnValueOnce("Bearer 243534656768urthdy3dg");

      const sharedBy = new mongoose.Types.ObjectId();
      jwt.verify = jest.fn().mockReturnValueOnce({ sub: sharedBy });
      auth(req as UserRequest, res as Response, next);

      expect(req).toHaveProperty("sharedBy", sharedBy);
    });
  });
});
