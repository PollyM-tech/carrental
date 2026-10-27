// Maintenance utility: read the password from stdin, never from source or a shell argument.
// Requires the authenticated Convex CLI; uses Convex Auth's internal credential API.
import { spawnSync } from 'node:child_process';
import { Password } from '@convex-dev/auth/providers/Password';
const email = 'movaracarhire@gmail.com';
const cli = ['node_modules/convex/bin/main.js', 'run'];
function run(args) {
  const result = spawnSync(process.execPath, [...cli, ...args], { encoding: 'utf8', timeout: 40000 });
  if (result.status !== 0) throw new Error('Unable to reach/update Convex. Secret-bearing output was suppressed.');
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}
let password = '';
for await (const chunk of process.stdin) password += chunk.toString();
password = password.replace(/\r?\n$/, '');
if (!password) throw new Error('Provide the admin password through stdin.');
const owner = run(['--inline-query', `const u = await ctx.db.query("users").filter(q=>q.eq(q.field("email"),${JSON.stringify(email)})).unique(); if (!u) return null; const m=await ctx.db.query("staffMemberships").withIndex("by_user",q=>q.eq("userId",u._id)).unique(); return {id:u._id,owner:!!(m?.active&&m.roles.includes("owner"))};`]);
if (!owner?.owner) throw new Error('The existing designated owner account must be provisioned before resetting credentials.');
const hashedSecret = await Password().crypto.hashSecret(password);
run(['security:resetOwnerPassword', JSON.stringify({ hashedSecret })]);
console.log('Admin password updated and existing sessions revoked atomically.');
const signedIn = run(['auth:signIn', JSON.stringify({ provider: 'password', params: { email, password, flow: 'signIn', portal: 'admin' } })]);
password = '';
if (!signedIn?.tokens?.token) throw new Error('Password was updated, but sign-in verification did not return a session.');
const payload = JSON.parse(Buffer.from(signedIn.tokens.token.split('.')[1], 'base64url').toString());
if (payload.sub.split('|')[0] !== owner.id) throw new Error('Unexpected authentication result.');
run(['auth:store', JSON.stringify({ args: { type: 'invalidateSessions', userId: owner.id } })]);
console.log('PASS: the admin password signs in to the designated owner account. Previous and verification sessions were invalidated.');
