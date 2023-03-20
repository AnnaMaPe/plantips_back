import request from "supertest";
import { maranta, spider } from "../../../mocks/tipsMocks";
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

describe("Given a DELETE to '/tips/delete/:id' endpoint", () => {
  describe("When it receives a request to  get all the tips", () => {
    test("Then it should respond with an status 200 ", async () => {
      const deleteTipsEndpoint = `${endpoints.tips}${endpoints.delete}`;
      const expectedStatus = 200;

      await Tip.create({
        commonName: "Maranta lemon",
        scientificName: "Epipemnum aureum",
        careLevel: "Best of connoisseurs",
        light: "Indirect light",
        water: "Once a week",
        tip: "Its leaves rise during the night, if you see that it stops doing so, it is time to water your Maranta!",
        image: "beatufiulplant.jpeg",
        sharedBy: "640631137b5cc26616353c5e",
      });

      const maranta = await Tip.findOne({ commonName: "Maranta lemon" });

      const sharedBy = new mongoose.Types.ObjectId();
      jwt.verify = jest.fn().mockReturnValueOnce({ sub: sharedBy });

      const response = await request(app)
        .delete(`${deleteTipsEndpoint}/${maranta!._id.toString()}`)
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFubmEiLCJzdWIiOiI2NDA2MzExMzdiNWNjMjY2MTYzNTNjNWUiLCJpYXQiOjE2NzkzMDM0OTQsImV4cCI6MTY3OTQ3NjI5NH0.RP-wJfAJqdVsB7lnKn97QcXLPSQ895iMBqB0mzsNnn8"
        )
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("tips");
    });
  });
});
