export const ROUTE_LOADING_START_EVENT = "ezqueue:route-loading-start";
export const ROUTE_LOADING_STOP_EVENT = "ezqueue:route-loading-stop";

export const startRouteLoading = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_LOADING_START_EVENT));
};

export const stopRouteLoading = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_LOADING_STOP_EVENT));
};
