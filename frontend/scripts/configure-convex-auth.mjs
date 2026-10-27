import { generateKeyPair, exportJWK, exportPKCS8 } from "jose";
import { randomBytes } from "node:crypto";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// No secret values are printed or included in shell commands.
function convex(args) {
  const result = spawnSync(process.execPath, ["--import", new URL("./node-network.mjs", import.meta.url).href, "node_modules/convex/bin/main.js", "env", ...args], { encoding: "utf8", timeout: 45000 });
  if (result.status !== 0) throw new Error("Convex environment update failed. Check CLI login/network and retry; secret output was suppressed.");
  return result.stdout.trim();
}
const names = new Set(convex(["list", "--names-only"]).split(/\s+/));
if (names.has("JWT_PRIVATE_KEY") !== names.has("JWKS")) throw new Error("Only one signing-key variable exists. Review the deployment before changing keys.");
const updates = [];
if (!names.has("JWT_PRIVATE_KEY")) {
  const keys = await generateKeyPair("RS256", { extractable: true });
  const privateKey = await exportPKCS8(keys.privateKey);
  const publicKey = await exportJWK(keys.publicKey);
  updates.push(`JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"`);
  updates.push(`JWKS='${JSON.stringify({ keys: [{ use: "sig", ...publicKey }] })}'`);
}
const localFile = ".env.owner-setup";
let setupCode;
try { setupCode = readFileSync(localFile, "utf8").match(/^MOVARA_OWNER_SETUP_SECRET=(.+)$/m)?.[1]; } catch { /* First setup. */ }
if (names.has("MOVARA_OWNER_SETUP_SECRET")) {
  setupCode = convex(["get", "MOVARA_OWNER_SETUP_SECRET"]);
} else {
  setupCode = randomBytes(32).toString("hex");
  updates.push(`MOVARA_OWNER_SETUP_SECRET=${setupCode}`);
}
if (!names.has("SITE_URL")) updates.push("SITE_URL=http://localhost:3000");
if (updates.length) {
  const folder = mkdtempSync(join(tmpdir(), "movara-auth-")); chmodSync(folder, 0o700);
  try {
    const file = join(folder, "auth.env"); writeFileSync(file, updates.join("\n")+"\n", { mode: 0o600 });
    convex(["set", "--from-file", file]);
  } finally { rmSync(folder, { recursive: true, force: true }); }
}
writeFileSync(localFile, `# Private initial owner setup code. Never commit or share it.\nMOVARA_OWNER_SETUP_SECRET=${setupCode}\n`, { mode: 0o600 }); chmodSync(localFile, 0o600);
console.log("Convex Auth environment is configured. Signing keys were preserved if already present.");
console.log("The private owner setup code is saved locally in frontend/.env.owner-setup (ignored by git).");
