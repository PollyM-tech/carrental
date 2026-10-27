// Maintenance utility: read the password from stdin, never from source or a shell argument.
// Requires the authenticated Convex CLI; uses Convex Auth's internal credential API.
import { spawnSync } from 'node:child_process';
import { emitKeypressEvents } from 'node:readline';
import { Password } from '@convex-dev/auth/providers/Password';
import { materializeCredentials } from '../convex/lib/credentials.js';
const email = 'movaracarhire@gmail.com';
const cli = ['node_modules/convex/bin/main.js', 'run'];
function run(args) {
  const result = spawnSync(process.execPath, ["--import", new URL("./node-network.mjs", import.meta.url).href, ...cli, ...args], { encoding: 'utf8', timeout: 40000 });
  if (result.status !== 0) throw new Error('Unable to reach/update Convex. Secret-bearing output was suppressed.');
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}
async function readPassword(label) {
  if (!process.stdin.isTTY) {
    let value = '';
    for await (const chunk of process.stdin) value += chunk.toString();
    return value.replace(/\r?\n$/, '');
  }
  process.stdout.write(label);
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === 'c' || key.name === 'escape') { finish(); reject(new Error('Password reset cancelled.')); return; }
      if (key.name === 'return' || key.name === 'enter') { finish(); resolve(value); return; }
      if (key.name === 'backspace') { value = Array.from(value).slice(0, -1).join(''); return; }
      if (text && !key.ctrl && !key.meta && !text.includes('\u001b')) value += text;
    };
    process.stdin.on('keypress', onKey);
  });
}
let password = await readPassword('New admin password (hidden): ');
if (process.stdin.isTTY) {
  const confirmation = await readPassword('Confirm admin password (hidden): ');
  if (confirmation !== password) throw new Error('Passwords do not match. No changes made.');
}
if (!password) throw new Error('Provide the admin password through stdin.');
const owner = run(['--inline-query', `const u = await ctx.db.query("users").filter(q=>q.eq(q.field("email"),${JSON.stringify(email)})).unique(); if (!u) return null; const m=await ctx.db.query("staffMemberships").withIndex("by_user",q=>q.eq("userId",u._id)).unique(); return {id:u._id,owner:!!(m?.active&&m.roles.includes("owner"))};`]);
if (!owner?.owner) throw new Error('The existing designated owner account must be provisioned before resetting credentials.');
const crypto = materializeCredentials(Password()).crypto;
if (!crypto?.hashSecret || !crypto.verifySecret) throw new Error('Password hashing is unavailable. No changes made.');
const hashedSecret = await crypto.hashSecret(password);
if (!(await crypto.verifySecret(password, hashedSecret))) throw new Error('Password hash verification failed. No changes made.');
run(['security:resetOwnerPassword', JSON.stringify({ hashedSecret })]);
console.log('Admin password updated and existing sessions revoked atomically.');
const signedIn = run(['auth:signIn', JSON.stringify({ provider: 'password', params: { email, password, flow: 'signIn', portal: 'admin' } })]);
password = '';
if (!signedIn?.tokens?.token) throw new Error('Password was updated, but sign-in verification did not return a session.');
const payload = JSON.parse(Buffer.from(signedIn.tokens.token.split('.')[1], 'base64url').toString());
if (payload.sub.split('|')[0] !== owner.id) throw new Error('Unexpected authentication result.');
run(['auth:store', JSON.stringify({ args: { type: 'invalidateSessions', userId: owner.id } })]);
console.log('PASS: the admin password signs in to the designated owner account. Previous and verification sessions were invalidated.');
