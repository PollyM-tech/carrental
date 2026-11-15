import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { resolveTheme, themeInitScript, currentTheme, setTheme, subscribeTheme } from '../src/lib/theme.ts';

test('saved preference overrides the device setting; first visits follow the device', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme('invalid', false), 'light');
});

test('the pre-paint script applies both theme and native-control color scheme', () => {
  for (const [saved, dark, expected] of [['light', true, 'light'], ['dark', false, 'dark'], [null, true, 'dark'], ['invalid', false, 'light']]) {
    const document = { documentElement: { dataset: {}, style: {} } };
    vm.runInNewContext(themeInitScript, { document, localStorage: { getItem: () => saved }, window: { matchMedia: () => ({ matches: dark }) } });
    assert.equal(document.documentElement.dataset.theme, expected);
    assert.equal(document.documentElement.style.colorScheme, expected);
  }
});

test('blocked local storage does not prevent the page choosing a usable theme', () => {
  const document = { documentElement: { dataset: {}, style: {} } };
  vm.runInNewContext(themeInitScript, { document, localStorage: { getItem: () => { throw Error('Storage blocked'); } }, window: { matchMedia: () => ({ matches: true }) } });
  assert.equal(document.documentElement.dataset.theme, 'dark');
});

test('manual switching persists, synchronizes tabs, and overrides later system changes', () => {
  const oldWindow = globalThis.window, oldDocument = globalThis.document;
  const saved = new Map(), listeners = new Map();
  const media = { matches: false, addEventListener: (_type, fn) => listeners.set('system', fn), removeEventListener: () => listeners.delete('system') };
  globalThis.document = { documentElement: { dataset: { theme: 'light' }, style: {} } };
  globalThis.window = { localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) }, matchMedia: () => media,
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type), dispatchEvent: event => listeners.get(event.type)?.(event) };
  try {
    let updates = 0;
    const unsubscribe = subscribeTheme(() => updates++);
    media.matches = true; listeners.get('system')();
    assert.equal(currentTheme(), 'dark');
    setTheme('light');
    assert.equal(saved.get('movara-theme'), 'light');
    assert.equal(currentTheme(), 'light');
    listeners.get('system')();
    assert.equal(currentTheme(), 'light');
    saved.set('movara-theme', 'dark'); listeners.get('storage')({ key: 'movara-theme' });
    assert.equal(currentTheme(), 'dark');
    assert.ok(updates >= 3);
    unsubscribe(); assert.equal(listeners.size, 0);
  } finally {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
  }
});
