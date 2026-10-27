import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout(1000);
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
const client = new ConvexHttpClient(url, { logger: false });
assert.equal(await client.query(makeFunctionReference("accounts:current"), {}), null);
console.log("PASS: Node reaches the Convex account endpoint.");
await assert.rejects(client.action(makeFunctionReference("auth:signIn"), {
  provider: "password", params: { flow: "signUp", email: "movaracarhire@gmail.com", password: "Connection-test-not-a-real-password!", setupCode: "invalid-network-check" },
}), /Owner registration requires the private setup code/);
console.log("PASS: auth:signIn reaches Convex and correctly rejects an invalid setup code.");
console.log("No accounts were created and no real passwords/setup codes were sent.");
