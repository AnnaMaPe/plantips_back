import { type Response, type Request, response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../../../database/models/User";
import {
  type RegisterUserCredentials,
  type UserCredentials,
} from "../../../Types/users/types";
import { loginUser, registerUserController } from "./userControllers";
import { CustomError } from "../../../CustomError/CustomError";
import { mockRegisterUser, mockUser } from "../../../mocks/userMocks";

beforeEach(() => {
  jest.clearAllMocks();
});

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
const next = jest.fn();

const expectedSuccesStatus = 200;

describe("Given a loginUser controller", () => {
  const req: Partial<
    Request<Record<string, unknown>, Record<string, unknown>, UserCredentials>
  > = {};

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

      expect(res.status).toHaveBeenCalledWith(expectedSuccesStatus);
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

describe("Given a registerUser controller", () => {
  const req = {} as Request<
    Record<string, unknown>,
    Record<string, unknown>,
    RegisterUserCredentials
  >;

  const expectedSuccesRegisteredStatus = 201;
  const expectedSuccesRegisteredMessage = "User was successfully registered";

  describe("When it receives a request for a user with username 'PlantLover' and password '12345678' and email 'plant.lover@gmail.com'", () => {
    test("Then it should call its status method with 201", async () => {
      req.body = mockRegisterUser;
      const hashedPassword = await bcryptjs.hash(mockRegisterUser.password, 8);

      const mockUserWithHashedPassword: RegisterUserCredentials = {
        ...mockRegisterUser,
        password: hashedPassword,
      };

      User.create = jest.fn().mockResolvedValue(mockUserWithHashedPassword);

      await registerUserController(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedSuccesRegisteredStatus);
      expect(res.json).toHaveBeenCalledWith({
        message: expectedSuccesRegisteredMessage,
      });
    });
  });

  describe("When it receives a request for a user without a username", () => {
    test("Then it should call its next method", async () => {
      const expectedError = new Error("User was not created");
      const userNotRegisteredError = new CustomError(
        "User was not created",
        500,
        "User was not created"
      );
      const hashedPassword = await bcryptjs.hash(mockRegisterUser.password, 8);
      const mockUserWithoutUserName: RegisterUserCredentials = {
        ...mockRegisterUser,
        password: hashedPassword,
        username: "",
      };

      req.body = mockUserWithoutUserName;

      User.create = jest.fn().mockRejectedValue(expectedError);

      await registerUserController(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(userNotRegisteredError);
    });
  });
});
