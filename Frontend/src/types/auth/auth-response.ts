import { ProfileUser } from "../user";

export type UserResponse = {
  userData: ProfileUser;
  tokenData: TokenType
  message: string;
};

export type TokenType = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  session: string;
};
