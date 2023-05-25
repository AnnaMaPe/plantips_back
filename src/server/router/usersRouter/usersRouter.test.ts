import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import mongoose from "mongoose";
import bcryptsjs from "bcryptjs";
import jsw, { TokenExpiredError } from "jsonwebtoken";
import { connectDatabase } from "../../../database/connectDatabase";
import { User } from "../../../database/models/User";
import {
  type RegisterUserCredentials,
  type UserCredentials,
} from "../../../Types/users/types";
import { app } from "../../app";
import { endpoints } from "../endpoints";
import { mockUser } from "../../../mocks/userMocks";
import { mockRegisterUser } from "../../../mocks/userMocks";

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDatabase(server.getUri());
});

afterAll(async () => {
  await server.stop();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany();
});

const loginEndpoint = `${endpoints.users}${endpoints.login}`;
const registerEndpoint = `${endpoints.users}${endpoints.register}`;

describe("Given a POST '/users/login' endpoint", () => {
  describe("When it receives a request to login a user with username 'PlantLover' and password '12345678'", () => {
    test("Then it should respond with a token", async () => {
      const expectedStatus = 200;
      const mocken = "ThisIsAMockedTocken";
      const hashedPassword = await bcryptsjs.hash(mockUser.password, 8);

      await User.create({
        username: mockUser.username,
        password: hashedPassword,
        email: mockRegisterUser.email,
      });
      jsw.sign = jest.fn().mockReturnValue(mocken);
      const response = await request(app)
        .post(loginEndpoint)
        .send(mockUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("token", mocken);
    });
  });

  describe("When it receives a request to login a user with username 'PlantLover' and a wrong password '12345699'", () => {
    test("Then it should respond with the method status 401", async () => {
      const expectedStatus = 401;
      const expectedMessage = "Wrong credentials";
      const wrongPassword = "12345699";
      const wrongHashedPassword = await bcryptsjs.hash(wrongPassword, 8);

      await User.create({
        username: mockUser.username,
        password: wrongHashedPassword,
        email: mockRegisterUser.email,
      });
      const response = await request(app)
        .post(loginEndpoint)
        .send(mockUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("error", expectedMessage);
    });
  });

  describe("When it receives a request to login a non-existing user with username 'Rose' and  password '12345677'", () => {
    test("Then it should respond with the method status 401 and an error message 'Wrong credentials'", async () => {
      const expectedStatus = 401;
      const expectedMessage = "Wrong credentials";
      const nonRegisteredUser: UserCredentials = {
        username: "Rose",
        password: "12345677",
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(nonRegisteredUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("error", expectedMessage);
    });
  });
});

describe("Given a POST '/users/register' endpoint", () => {
  describe("When it receives a request to register a user with username 'PlantLover' and password '12345678'", () => {
    test("Then it should respond with the method status 201 and a message 'User was successfully registered'", async () => {
      const expectedStatus = 201;
      const expectedSuccesMessage = "User was successfully registered";

      const response = await request(app)
        .post(registerEndpoint)
        .send(mockRegisterUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("message", expectedSuccesMessage);
    });
  });

  describe("When it receives a request to register a user with username 'PlantLover' and password '12345678' and there is a data base error", () => {
    test("Then it should respond with the method status 500 and an error message 'User was not created'", async () => {
      const expectedStatus = 500;
      const expectedErrorMessage = "User was not created";
      const missingDataMockUser: RegisterUserCredentials = {
        ...mockRegisterUser,
        username: "",
      };

      const response = await request(app)
        .post(registerEndpoint)
        .send(missingDataMockUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("error", expectedErrorMessage);
    });
  });
});
