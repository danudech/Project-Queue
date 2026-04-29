import { add } from "@dnd-kit/utilities";

export const internalEndpoints = {
  health: "/api/health",
  signout: "/api/auth/logout",
  authRefresh: "/api/auth/refresh",

  profile: "/api/auth/me",
  userlogin: "/api/auth/login",
  refreshToken: "/api/auth/refresh-token",
  userregister: "/api/user/register",
  resendconfirmation: "/api/user/resendconfirmation",
  verifyaccount: "/api/user/verifyaccount",
  resetpassword: "/api/user/resetpassword",
  forgotpassword: "/api/auth/forgot-password",

  shopdata: "/api/shop/get-shop",
  shoptype: "/api/shop/shop-type",
  newshop: "/api/shop/new-shop",
  newbranch : "/api/shop/new-branch",

  addressbyzipcode: "/api/address/by-zipcode",
} as const;

export type InternalEndpointKey = keyof typeof internalEndpoints;

export const externalEndpoints = {
  health_api: "/api/health",
  login: "/api/v1/auth/login",
  register: "/api/v1/user/register",
  resendconfirmation: "/api/v1/user/resendconfirmation",
  verifyaccount: "/api/v1/user/verifyaccount",
  refreshToken: "/api/v1/auth/refresh-token",
  userConsent: "/api/v1/auth/user-consent",

  profile: "/api/v1/auth/me",
  userlogin: "/api/v1/auth/login",
  resetpassword: "/api/v1/user/resetpassword",
  forgotpassword: "/api/v1/auth/forgot-password",

  shopdata: "/api/v1/shop/get-shop",
  shoptype: "/api/v1/shop/shop-type",
  newshop: "/api/v1/shop/new-shop",
  newbranch : "/api/v1/shop/new-branch",

  addressbyzipcode: "/api/v1/address/by-zipcode",
} as const;

export type ExternalEndpointKey = keyof typeof externalEndpoints;
