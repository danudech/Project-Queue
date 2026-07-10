import { InternalEndpointKey, internalEndpoints } from "@/config/endpoints";
import { createHttp } from "./centralize";

export const http = createHttp<InternalEndpointKey | (string & {})>(internalEndpoints);
