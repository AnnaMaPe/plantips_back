import {
  type RegisterUserCredentials,
  type UserCredentials,
} from "../Types/users/types";

export const mockUser: UserCredentials = {
  username: "PlantLover",
  password: "12345678",
};

export const mockRegisterUser: RegisterUserCredentials = {
  ...mockUser,
  email: "plant.lover@gmail.com",
};
