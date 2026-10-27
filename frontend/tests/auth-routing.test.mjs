import test from "node:test";
import assert from "node:assert/strict";
import { signedInHome } from "../src/lib/auth-routing.ts";

test("owner and staff land on the admin dashboard", () => {
  for (const role of ["owner", "admin", "finance", "front_desk"]) assert.equal(signedInHome({ staff: true, roles: [role] }), "/dashboard");
});
test("customers land on their own workspace", () => {
  assert.equal(signedInHome({ staff: false, roles: [] }), "/workspace");
});
test("an inactive role does not grant dashboard access", () => {
  assert.equal(signedInHome({ staff: false, roles: ["owner"] }), "/workspace");
  assert.equal(signedInHome({ staff: true, roles: [] }), "/workspace");
});
