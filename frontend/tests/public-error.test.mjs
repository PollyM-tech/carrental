import test from 'node:test';
import assert from 'node:assert/strict';
import { ConvexError } from 'convex/values';
import { publicErrorMessage } from '../src/lib/public-error.ts';
test('unexpected backend errors and stacks never become customer-facing messages', () => {
  const fallback = 'Please contact Movara.';
  for (const error of [new Error('[CONVEX M(bookingRequests:create)] [Request ID: example] Server Error'), new Error('https://deployment.convex.site/private'), new Error('Uncaught Error: internal database details'), { message: 'private backend details' }, null]) assert.equal(publicErrorMessage(error, fallback), fallback);
});
test('only explicitly safe structured errors pass through', () => {
  const message = 'This vehicle is unavailable for those dates. Choose another vehicle or dates.';
  assert.equal(publicErrorMessage(new ConvexError({ code: 'BOOKING_UNAVAILABLE', message })), message);
  for (const data of [{ code: 'INTERNAL', message: 'internal details' }, { code: 'INVALID_INPUT', message: 'See https://deployment.convex.site' }, { code: 'INVALID_INPUT', message: 'details\n at handler (backend.js:4)' }, 'private details']) assert.equal(publicErrorMessage(new ConvexError(data), 'Retry with Movara.'), 'Retry with Movara.');
});
test('network failures use the business name without showing infrastructure addresses', () => {
  assert.equal(publicErrorMessage(new Error('fetch failed from deployment.convex.site')), 'Unable to reach Movara. Check your connection and try again.');
});
