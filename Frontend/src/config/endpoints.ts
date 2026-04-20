export const internalEndpoints = {
  health: "/api/health",
  signout: "/api/auth/logout",
  authRefresh: "/api/auth/refresh",

  line_authorize: "/api/auth/line-login",
  line_logout: "/api/auth/line-logout",
  line_refresh_token: "/api/auth/line-refresh-token",

  friends: "/api/user/friends/list",
  friends_incoming: "/api/user/friends/incomingfriends",
  friends_outgoing: "/api/user/friends/outgoingfriends",
  addfriend: "/api/user/friends/addfriend",
  cancelfriend: "/api/user/friends/cancelfriend",
  acceptfriend: "/api/user/friends/acceptfriend",
  rejectfriend: "/api/user/friends/rejectfriend",
  deletefriend: "/api/user/friends/deletefriend",

  user_getevents: "/api/user/event/list",
  user_addevents: "/api/user/event/addevent",

  profile: "/api/user/profile",
  userlogin: "/api/auth/login",
  userregister: "/api/user/register",
} as const;

export type InternalEndpointKey = keyof typeof internalEndpoints;

export const externalEndpoints = {
  health_api: "/api/health",
  login: "/api/v1/auth/login",
  register: "/api/v1/user/register",
  refreshToken: "/api/v1/auth/refresh",
  userConsent: "/api/v1/auth/user-consent",

  line_authorize: "/api/v1/auth/line-login",
  line_logout: "/api/v1/auth/line-logout",
  line_refresh_token: "/api/v1/auth/line-refresh-token",

  friends: "/api/v1/user/friends",
  friends_incoming: "/api/v1/user/requests/incoming",
  friends_outgoing: "/api/v1/user/requests/outgoing",
  addfriend: "/api/v1/user/requests/addfriend",
  cancelfriend: "/api/v1/user/requests/cancelfriend",
  acceptfriend: "/api/v1/user/requests/acceptfriend",
  rejectfriend: "/api/v1/user/requests/rejectfriend",
  deletefriend: "/api/v1/user/requests/deletefriend",

  profile: "/api/v1/user/profile",
  userlogin: "/api/v1/auth/login",


  user_getevents: "/api/v1/event/event",
  user_addevents: "/api/v1/event/addevent",

} as const;

export type ExternalEndpointKey = keyof typeof externalEndpoints;
