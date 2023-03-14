import { type Response, type Request } from "express";
import { CustomError } from "../../../CustomError/CustomError";
import { Tip } from "../../../database/models/Tip";
import { maranta, spider } from "../../../mocks/tipsMocks";
import { type UserRequest } from "../../../Types/users/types";
import { getMyTips, getTips } from "./tipControllers";

const tipsList = [maranta, spider];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given a getTips controller", () => {
  const req: Partial<Request> = {};
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockResolvedValue(maranta),
  };
  const next = jest.fn();
  const expectedStatus = 200;
  describe("When it receives a request to obtain tips", () => {
    test("Then it should call its status method with an status 200 and a its json with the found tip", async () => {
      Tip.find = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue(maranta),
      }));
      await getTips(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ tips: maranta });
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

describe("Given a getMyTips controller", () => {
  describe("When it receives a request to obtain tips froms user '1229379442'", () => {
    test("Then it should call its status method with a status 200 ", async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(tipsList),
      };
      const next = jest.fn();
      req.body = { sharedBy: maranta.sharedBy };
      const expectedStatus = 200;

      Tip.find = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue({ sharedBy: maranta.sharedBy }),
      }));
      await getMyTips(req as UserRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });

  describe("When it receives a  bad request ", () => {
    test("Then it should call its next method with an error and status 400", async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(undefined),
      };
      const next = jest.fn();

      const expectedError = new CustomError(
        "Bad request",
        400,
        "Not possible to obtain your Tips"
      );

      Tip.find = jest.fn().mockReturnValue(undefined);

      await getMyTips(req as UserRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
