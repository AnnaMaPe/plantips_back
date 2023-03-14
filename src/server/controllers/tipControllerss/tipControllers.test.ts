import { type Response, type Request } from "express";
import { CustomError } from "../../../CustomError/CustomError";
import { Tip } from "../../../database/models/Tip";
import { type TipStructure } from "../../../Types/tips/types";
import { getTips } from "./tipControllers";

const mockTip: TipStructure = {
  id: "23242424334",
  commonName: "Maranta lemon",
  scientificName: "Epipemnum aureum",
  careLevel: "Best of connoisseurs",
  light: "Indirect light",
  water: "Once a week",
  tip: "Its leaves rise during the night, if you see that it stops doing so, it is time to water your Maranta!",
  image: "beatufiulplant.jpeg",
  sharedBy: "1229379442",
};

beforeEach(() => {
  jest.clearAllMocks();
});

const req: Partial<Request> = {};
const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockResolvedValue(mockTip),
};
const next = jest.fn();

describe("Given a getTips controller", () => {
  describe("When it receives a request to obtain tips", () => {
    test("Then it should call its status method with an status 200 and a its json with the found tip", async () => {
      const expectedStatus = 200;

      Tip.find = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue(mockTip),
      }));
      await getTips(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ tips: mockTip });
    });
  });

  describe("When it receives a bad request", () => {
    test("Then it should call its next method method with an error ", async () => {
      const expectedStatus = 401;
      const expectedErrorMessage = "Couldn't retrieve tips";

      const error = new CustomError(
        expectedErrorMessage,
        expectedStatus,
        expectedErrorMessage
      );
      Tip.find = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockRejectedValue(error),
      }));
      await getTips(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
