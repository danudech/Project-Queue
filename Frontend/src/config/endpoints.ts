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
  changepassword: "/api/user/changepassword",
  forgotpassword: "/api/auth/forgot-password",
  updateprofile: "/api/user/updateprofile",

  shopdata: "/api/shop/get-shop",
  shoptype: "/api/shop/shop-type",
  newshop: "/api/shop/new-shop",
  newbranch: "/api/shop/new-branch",
  updateshop: "/api/shop/update-shop",
  updatebranch: "/api/shop/update-branch",

  shopcategory: "/api/shop-category",
  shopservices: "/api/shop-services",
  servicephoto: "/api/shop-services/image",

  customer: "/api/customer",
  booking: "/api/booking",
  staff: "/api/operations/staff",
  staffphoto: "/api/operations/staff/photo",
  staffinvite: "/api/operations/staff/invite",
  roles: "/api/roles",
  slots: "/api/operations/slots",
  queues: "/api/operations/queues",
  catalog: "/api/operations/catalog",
  publicBooking: "/api/public/booking",
  notifications: "/api/notifications",
  chat: "/api/chat",
  publicChat: "/api/public/chat",

  businesshours: "/api/shop/business-hours",
  holidays: "/api/shop/holidays",
  holidaySync: "/api/shop/holidays/sync",
  queuerules: "/api/shop/queue-rules",

  addressbyzipcode: "/api/address",
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
  changepassword: "/api/v1/user/changepassword",
  forgotpassword: "/api/v1/auth/forgot-password",
  updateprofile: "/api/v1/user/profile",

  shopdata: "/api/v1/shop/get-shop",
  shoptype: "/api/v1/shop/shop-type",
  newshop: "/api/v1/shop/new-shop",
  newbranch: "/api/v1/shop/new-branch",
  updateshop: "/api/v1/shop/update-shop",
  updatebranch: "/api/v1/shop/update-branch",

  shopcategory: "/api/v1/shop/category/get-category",
  newshopcategory: "/api/v1/shop/category/add-category",
  shopupdatecategory: "/api/v1/shop/category/update-category",
  deleteshopcategory: "/api/v1/shop/category/delete-category",

  service: "/api/v1/shop/services/get-services",
  newservices: "/api/v1/shop/services/add-service",
  updateservices: "/api/v1/shop/services/update-service",
  deleteservices: "/api/v1/shop/services/delete-service",

  staff: "/api/v1/operations/staff",
  staffinvite: "/api/v1/operations/staff/invite",
  eligiblestaff: "/api/v1/operations/staff/eligible",
  slots: "/api/v1/operations/slots",
  bookings: "/api/v1/operations/bookings",
  queues: "/api/v1/operations/queues",
  catalog: "/api/v1/operations/catalog",
  publicBooking: "/api/v1/public/booking",
  notifications: "/api/v1/notifications",
  chat: "/api/v1/chat",
  publicChat: "/api/v1/public/chat",

  customer: "/api/v1/customer/get-customer",
  newcustomer: "/api/v1/customer/add-customer",
  updatecustomer: "/api/v1/customer/update-customer",
  deletecustomer: "/api/v1/customer/delete-customer",

  businesshours: "/api/v1/shop/business-hours",
  holidays: "/api/v1/shop/holidays",
  queuerules: "/api/v1/shop/queue-rules",

  addressbyzipcode: "/api/v1/address/by-zipcode",
} as const;

export type ExternalEndpointKey = keyof typeof externalEndpoints;
