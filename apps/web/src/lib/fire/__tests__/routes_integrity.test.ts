import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appFile = path.resolve(__dirname, '../../../App.tsx');
const navbarFile = path.resolve(__dirname, '../../../components/layout/Navbar.tsx');

test('Route Integrity & Additive Safety', async (t) => {
  const appContent = fs.readFileSync(appFile, 'utf8');
  const navbarContent = fs.readFileSync(navbarFile, 'utf8');

  const requiredRoutes = [
    '/',
    '/simulator',
    '/build',
    '/evidence',
    '/experiments',
    '/explorer',
    '/explore',
    '/stories/v2',
    '/ask',
    '/gaps',
    '/about',
    '/response',
  ];

  for (const route of requiredRoutes) {
    await t.test(`App.tsx preserves route "${route}"`, () => {
      const routeRegex = new RegExp(`path=["']${route.replace('/', '\\/')}["']`);
      assert.ok(routeRegex.test(appContent), `Route ${route} must be defined in App.tsx`);
    });
  }

  await t.test('Navbar.tsx links to /response', () => {
    assert.ok(navbarContent.includes('to="/response"'), 'Navbar must include link to /response');
    assert.ok(navbarContent.includes('Fire Response'), 'Navbar must display "Fire Response" label');
  });
});

