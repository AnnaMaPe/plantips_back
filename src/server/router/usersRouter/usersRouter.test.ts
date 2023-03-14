import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import mongoose from "mongoose";
import bcryptsjs from "bcryptjs";
import jsw, { TokenExpiredError } from "jsonwebtoken";
import { connectDatabase } from "../../../database/connectDatabase";
import { User } from "../../../database/models/User";
import { type UserCredentials } from "../../../Types/users/types";
import { app } from "../../app";

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

const loginEndpoint = "/plantips/login";

const mockUser: UserCredentials = {
  username: "Daisy",
  password: "12345678",
};

describe("Given a POST '/plantips/login' endpoint", () => {
  describe("When it receives a request to login a user with username 'Daisy' and password '12345678'", () => {
    test("Then it should respond with a token", async () => {
      const expectedStatus = 200;
      const mocken = "ThisIsAMockedTocken";
      const hashedPassword = await bcryptsjs.hash(mockUser.password, 8);

      await User.create({
        username: "Daisy",
        password: hashedPassword,
        email: "hi@daisy.com",
      });
      jsw.sign = jest.fn().mockReturnValue(mocken);
      const response = await request(app)
        .post(loginEndpoint)
        .send(mockUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("token", mocken);
    });
  });

  describe("When it receives a request to login a user with username 'Daisy' and a wrong password '12345699'", () => {
    test("Then it should respond with the method status 401", async () => {
      const expectedStatus = 401;
      const expectedMessage = "Wrong credentials";
      const wrongPassword = "12345699";
      const wrongHashedPassword = await bcryptsjs.hash(wrongPassword, 8);

      await User.create({
        username: "Daisy",
        password: wrongHashedPassword,
        email: "hi@daisy.com",
      });
      const response = await request(app)
        .post(loginEndpoint)
        .send(mockUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("error", expectedMessage);
    });
  });

  describe("When it receives a request to login a non-existing user with username 'Rose' and  password '12345677'", () => {
    test("Then it should respond with the method status 401", async () => {
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
