import test from "node:test";
import assert from "node:assert/strict";
import { normaliseEmail, passwordProfile, OWNER_EMAIL, validateNewPassword } from "../convex/lib/identity.ts";
import { requireUser, requireRole } from "../convex/lib/permissions.ts";

function context({ signedIn = true, exists = true, membership = null, email = "customer@example.com" } = {}) {
  const user = { _id: "test-user", email };
  return {
    auth: { getUserIdentity: async () => signedIn ? { subject: "test-user|test-session" } : null },
    db: {
      get: async key => key === "test-session" ? { _id: key, userId: "test-user", expirationTime: Date.now() + 60000, _creationTime: Date.now() - 1000 } : exists ? user : null,
      query: table => ({ withIndex: () => ({ unique: async () => table === "movaraCredentialGuards" ? { secretHash: "hash", changedAt: Date.now() - 2000 } : table === "authAccounts" ? { secret: "hash" } : table === "movaraSessionActivity" ? null : membership }) }),
    },
  };
}

test("email is normalised and malformed values rejected", () => {
  assert.equal(normaliseEmail("  CUSTOMER@Example.com "), "customer@example.com");
  for (const input of [null, {}, "", "customer", "a b@example.com"]) assert.throws(() => normaliseEmail(input));
});
test("new password limits", () => {
  assert.throws(() => validateNewPassword("short"));
  assert.throws(() => validateNewPassword("a".repeat(129)));
  validateNewPassword("a".repeat(12));
});
test("customer signup input cannot choose permissions or verified status", () => {
  assert.deepEqual(passwordProfile({ email: "customer@example.com", phone: "+447700900123", flow: "signUp", roles: ["owner"], emailVerificationTime: 1, userId: "other-user" }, undefined), { email: "customer@example.com", phone: "+447700900123" });
});
test("owner signup is blocked without configured and correct setup secret", () => {
  for (const secret of [undefined, "private-setup-code"]) assert.throws(() => passwordProfile({ email: OWNER_EMAIL, flow: "signUp", setupCode: "wrong-code" }, secret));
});
test("owner setup accepts correct secret and normalises email", () => {
  assert.deepEqual(passwordProfile({ email: OWNER_EMAIL.toUpperCase(), flow: "signUp", setupCode: "private-code" }, "private-code"), { email: OWNER_EMAIL });
});
test("owner sign-in does not require reusing setup secret", () => {
  assert.deepEqual(passwordProfile({ email: OWNER_EMAIL, flow: "signIn", portal: "admin" }, undefined), { email: OWNER_EMAIL });
});
test("anonymous access is rejected", async () => {
  await assert.rejects(requireUser(context({ signedIn: false })), /Sign in/);
});
test("deleted user identity is rejected", async () => {
  await assert.rejects(requireUser(context({ exists: false })), /unavailable/);
});
test("customer cannot access staff operations", async () => {
  await assert.rejects(requireRole(context(), "finance"), /permission/);
});
test("inactive staff cannot access staff operations", async () => {
  await assert.rejects(requireRole(context({ membership: { active: false, roles: ["owner"] } }), "finance"), /permission/);
});
test("legacy staff roles cannot operate the single-admin system", async () => {
  for (const role of ["admin", "front_desk", "finance", "kyc_reviewer", "fleet_manager", "owner"]) {
    await assert.rejects(requireRole(context({ membership: { active: true, roles: [role] } }), "finance"), /permission/);
  }
});
test("only the designated active owner can perform admin actions", async () => {
  const ctx = context({ email: OWNER_EMAIL, membership: { active: true, roles: ["owner"] } });
  assert.equal((await requireRole(ctx, "finance")).user.email, OWNER_EMAIL);
  await assert.rejects(requireRole(context({ email: OWNER_EMAIL, membership: { active: false, roles: ["owner"] } })), /permission/);
  await assert.rejects(requireRole(context({ email: OWNER_EMAIL, membership: { active: true, roles: ["admin"] } })), /permission/);
});
test("public customer portal does not accept owner sign-in", () => {
  assert.throws(() => passwordProfile({ email: OWNER_EMAIL, flow: "signIn", portal: "customer" }, undefined), /private admin/);
  assert.throws(() => passwordProfile({ email: OWNER_EMAIL, flow: "signIn" }, undefined), /private admin/);
});
