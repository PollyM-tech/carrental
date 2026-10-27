/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as auth from "../auth.js";
import type * as bookingRequests from "../bookingRequests.js";
import type * as customerCare from "../customerCare.js";
import type * as http from "../http.js";
import type * as lib_booking_input from "../lib/booking_input.js";
import type * as lib_identity from "../lib/identity.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_rental_checks from "../lib/rental_checks.js";
import type * as lib_security_policy from "../lib/security_policy.js";
import type * as lib_session_guard from "../lib/session_guard.js";
import type * as lib_vehicle_rules from "../lib/vehicle_rules.js";
import type * as security from "../security.js";
import type * as vehicles from "../vehicles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  auth: typeof auth;
  bookingRequests: typeof bookingRequests;
  customerCare: typeof customerCare;
  http: typeof http;
  "lib/booking_input": typeof lib_booking_input;
  "lib/identity": typeof lib_identity;
  "lib/permissions": typeof lib_permissions;
  "lib/rental_checks": typeof lib_rental_checks;
  "lib/security_policy": typeof lib_security_policy;
  "lib/session_guard": typeof lib_session_guard;
  "lib/vehicle_rules": typeof lib_vehicle_rules;
  security: typeof security;
  vehicles: typeof vehicles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
