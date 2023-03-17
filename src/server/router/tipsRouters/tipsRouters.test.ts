import request from "supertest";
import { maranta } from "../../../mocks/tipsMocks";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase } from "../../../database/connectDatabase";
import { Tip } from "../../../database/models/Tip";
import { app } from "../../app";
import { endpoints } from "../endpoints";
import jwt from "jsonwebtoken";

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
  await Tip.deleteMany();
});

describe("Given a GET to '/tips' endpoint", () => {
  describe("When it receives a request to  get all the tips", () => {
    test("Then it should respond with an status 200 ", async () => {
      const expectedStatus = 200;
      const getTipsEndpoint = endpoints.tips;

      const sharedBy = new mongoose.Types.ObjectId();
      jwt.verify = jest.fn().mockReturnValueOnce({ sub: sharedBy });
      const response = await request(app)
        .get(getTipsEndpoint)
        .set("Authorization", "Bearer 243534656768urthdy3dg")
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("tips");
    });
  });
});
