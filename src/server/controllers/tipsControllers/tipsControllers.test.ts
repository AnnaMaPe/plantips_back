import { type Response, type Request } from "express";
import { CustomError } from "../../../CustomError/CustomError";
import { Tip } from "../../../database/models/Tip";
import { maranta, spider } from "../../../mocks/tipsMocks";
import { type UserRequest } from "../../../Types/users/types";
import {
  createTip,
  deleteTipById,
  getMyTips,
  getTipById,
  getTips,
} from "./tipsControllers";

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
  describe("When it receives a request to obtain tips without being filtered", () => {
    test("Then it should call its status method with an status 200 and a its json with the found tip", async () => {
      const req: Partial<Request> = {
        query: {},
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(maranta),
      };
      const next = jest.fn();
      Tip.find = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue(maranta),
      }));
      await getTips(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ tips: maranta });
    });
  });

  describe("When it receives a request to obtain tips being filtered by careLevel 'Best for connoisseurs'", () => {
    test("Then it should call its status method with an status 200 and a its json with the found tip", async () => {
      const req: Partial<Request> = {
        query: { careLevel: "only-for-experts" },
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(maranta),
      };
      const next = jest.fn();

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
      const req: Partial<Request> = {
        query: {},
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(maranta),
      };
      const next = jest.fn();

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

describe("Given a deleteTipById controller", () => {
  describe("When it receives a request to delete the Maranta tip", () => {
    test("Then it should call its status method with a status 200 ", async () => {
      const req: Partial<UserRequest> = { params: { id: maranta.id } };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(maranta.id),
      };
      const next = jest.fn();
      const expectedStatus = 200;

      Tip.findByIdAndDelete = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue(maranta),
      }));
      await deleteTipById(req as UserRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });
  describe("When it receives a  bad request ", () => {
    test("Then it should call its next method with an error and status 500", async () => {
      const req: Partial<UserRequest> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue({}),
      };
      const next = jest.fn();

      req.params = {};

      const expectedError = new CustomError(
        "Internal Server Error",
        500,
        "Not possible to delete the Tip"
      );

      Tip.findByIdAndDelete = jest.fn().mockReturnValue(undefined);

      await deleteTipById(req as UserRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a createTipById controller", () => {
  describe("When it receives a request to create a Maranta tip", () => {
    test("Then it should call its status method with a status 201", async () => {
      const req: Partial<UserRequest> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      const expectedStatus = 201;

      Tip.create = jest.fn().mockReturnValue({ ...maranta });
      await createTip(req as UserRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });
  describe("When it receives a  bad request ", () => {
    test("Then it should call its next method with an error and status 500", async () => {
      const req: Partial<UserRequest> = {};
      const res: Partial<Response> = {};
      const next = jest.fn();

      req.body = {};

      const expectedError = new CustomError(
        "Not possible to create a Tip",
        500,
        "Tip not created. Try again!"
      );

      await createTip(req as UserRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a getTipById controller", () => {
  describe("When it receives a request to obtain the maranta tip ", () => {
    test("Then it should call its status method with a status 200 ", async () => {
      const req: Partial<Request> = { params: { id: maranta.id } };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue(maranta),
      };
      const next = jest.fn();
      req.body = { _id: maranta.id };
      const expectedStatus = 200;

      Tip.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockReturnValue({ _id: maranta.id }),
      }));
      await getTipById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });
  });

  describe("When it receives a  bad request ", () => {
    test("Then it should call its next method with an error and status 500", async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockResolvedValue({}),
      };
      const next = jest.fn();

      req.params = {};

      const expectedError = new CustomError(
        "Internal Server Error",
        500,
        "Not possible to find the Tip"
      );

      Tip.findById = jest.fn().mockReturnValue(undefined);

      await getTipById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
