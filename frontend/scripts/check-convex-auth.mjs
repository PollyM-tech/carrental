import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
function convex(args) {
  return spawnSync(process.execPath, ["--import", new URL("./node-network.mjs", import.meta.url).href, "node_modules/convex/bin/main.js", ...args], { encoding: "utf8", timeout: 45000 });
}
const account = convex(["run", "accounts:current", "{}"]);
assert.equal(account.status, 0, "The account query must be deployed and callable.");
assert.ok(["", "null"].includes(account.stdout.trim()), "Anonymous requests must not return account data.");
console.log("PASS: anonymous requests receive no account data.");
const result = convex(["run", "auth:signIn", JSON.stringify({ provider: "password", params: {
  flow: "signUp", email: "movaracarhire@gmail.com", password: "Smoke-test-not-a-real-password-2026!", setupCode: "invalid-smoke-test-code",
} })]);
assert.notEqual(result.status, 0, "Owner signup must reject an incorrect setup code.");
assert.match(result.stderr+result.stdout, /Owner registration requires the private setup code/);
console.log("PASS: owner signup without the correct setup code is rejected.");
const env = convex(["env", "list", "--names-only"]);
assert.equal(env.status, 0);
for (const name of ["JWT_PRIVATE_KEY", "JWKS"]) assert.ok(env.stdout.split(/\s+/).includes(name), `Missing auth configuration: ${name}`);
console.log("PASS: required auth environment variables are configured; values were not printed.");
console.log("No customer or owner accounts were created. A browser signup/sign-in check is still required.");
