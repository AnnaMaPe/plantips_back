import { type Response, type Request, response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../../../database/models/User";
import { type UserCredentials } from "../../../Types/users/types";
import { loginUser } from "./userControllers";
import { CustomError } from "../../../CustomError/CustomError";

beforeEach(() => {
  jest.clearAllMocks();
});

const req: Partial<
  Request<Record<string, unknown>, Record<string, unknown>, UserCredentials>
> = {};
const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
const next = jest.fn();

const mockUser: UserCredentials = {
  username: "PlantLover",
  password: "12345678",
};

describe("Given a loginUser controller", () => {
  describe("When it receives a request for a user with username 'PlantLover' and password '12345678' that it is not registered in the database", () => {
    test("Then it should call its next method with a status code 401, the message 'User not found' and the public message 'Wrong credentials' ", async () => {
      const error = new CustomError("User not found", 401, "Wrong credentials");
      req.body = mockUser;

      User.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(undefined),
      }));
      await loginUser(
        req as Request<
          Record<string, unknown>,
          Record<string, unknown>,
          UserCredentials
        >,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("When it receives a request for a user with username 'PlantLover' and password '12345678' that it is already registered in the database", () => {
    test("Then it should call its status method with 200", async () => {
      req.body = mockUser;
      const expectedStatus = 200;
      const mocken = "thisisafaketoken";
      const expectedMocken = { token: mocken };

      User.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          _id: new mongoose.Types.ObjectId(),
        }),
      }));

      bcryptjs.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue(mocken);
      await loginUser(
        req as Request<
          Record<string, unknown>,
          Record<string, unknown>,
          UserCredentials
        >,
        res as Response,
        next
      );

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(expectedMocken);
    });
  });

  describe("When it receives a request for a user with username 'PlantLover' and an incorrect password '12345611' that it is already registered in the database", () => {
    test("Then it should call its next method with a status code 401, the message 'Wrong password' and the public message 'Wrong credentials'", async () => {
      const error = new CustomError("Wrong password", 401, "Wrong credentials");
      req.body = mockUser;

      User.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          _id: new mongoose.Types.ObjectId(),
        }),
      }));

      bcryptjs.compare = jest.fn().mockResolvedValue(false);
      await loginUser(
        req as Request<
          Record<string, unknown>,
          Record<string, unknown>,
          UserCredentials
        >,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
