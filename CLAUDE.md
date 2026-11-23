# Qlack: how we work

Daniel is learning by building, in very small steps.

## Who writes the code
- **UI (`web/`): you write the code.** Daniel follows along, checks each step and steers.
- **Engine and server (`engine/`, `server/`): Daniel writes the code.** You explain, give pseudocode and review. Write real code there only when he explicitly asks.

## Collaboration rules
- **Tiny steps, one at a time.** Each step is one small, focused change (one file, one component, one concept). Introduce something only when the current step needs it. Never batch several steps together.
- **Before each step,** say in a line or two what you're about to build and why.
- **After each step, stop.** Briefly explain what you wrote and the key idea behind it, give Daniel a check he can run or see (a command, a page, what he should expect), and wait for him before moving on.
- **Ask him a question** when a concept is worth working out himself, then confirm or correct.
- **Be brief.** Short answers; elaborate only when needed.
- Use **bun** only (not npm). The repo is a Bun workspace: `engine/`, `server/`, `web/`.
- Track work in Linear (team "Glover's Projects", project Qlack). Close each ticket with a summary comment and carry deferred items into the next one.

## Where things stand
- **Phase 0–1 done:** engine (GLO-231), seeded words (GLO-232), rooms (GLO-233), clock sync (GLO-234), race loop (GLO-235), reconnection (GLO-236). The server is authoritative.
- **Phase 2 started:** GLO-237 done. Angular 22 + Tailwind v4 in `web/` (branch `web`), tokens, semantic layer, fonts, primitives (Card, Button, Pill, Avatar) and the `/sheet` route.
- **Next:** the next ticket in Linear.
- **Carried forward:**
  - quiet cards use `radius-card` (16px); the design wants `radius-button` (12px) on night cards. Add when the race screen needs it.
  - Avatar `size` input (picker 168px, rail 16px). Add when the first screen needs it.
  - reconnect UX: up to 3 attempts in 8 s, "Reconnecting…" frozen input, real Wi-Fi test
  - decide whether `start` is refused while a lobby player is disconnected
  - server refactor: `requireRoom(ws)` and `newPlayer(ws, name)` helpers; remove temporary logs

## Design system
The source of truth is `web/design/tokens.json` and `web/design/README.md` (exported from Claude Design). Read the README before any UI step. Key rules:
- **Loud vs quiet.** Loud (landing, lobby, results): `q-paper`, ink outlines, hard offset shadows, player colours. Quiet (race): `q-night` surface. Never mix them on one surface.
- **Every colour is a CSS variable.** No hardcoded colours in components.
- **Fonts:** Familjen Grotesk (display/body), DM Mono (labels, numbers, codes), Roboto Mono (race word field only).
- **Shadows** are hard, with no blur. Radii grow with element size.
- **Player palette:** 8 colours, one per racer (added `q-mint`, `q-sun`, `q-magenta` in GLO-237).
- **Styling:** Tailwind v4. Tokens live in `web/src/styles/tokens.css` (`@theme`, Tailwind defaults cleared); roles in `semantic.css` (`bg-surface`, `text-fg`, `border-line`…). Components use the roles; player colours use `playerFill` from `ui/player-color.ts`.
- **Tooling:** Angular CLI needs Node ≥ 22.22 (nvm default is 22). Bun installs; Node runs `ng`.

## GLO-237 plan (done)
1. Scaffold Angular in `web/` (CSS, routing, no SSR). Add `web` to the workspaces and `@qlack/engine: workspace:*`.
2. Tokens as CSS variables, plus a semantic layer (`--surface`, `--fg`, `--line`…) that `[data-register="quiet"]` remaps, so one component works in both registers.
3. Fonts.
4. Primitives, one per step: Card, Button (with the CTA shadow), Pill/chip, keycap avatar slot.
5. A `/sheet` route that renders every primitive in both registers.

**Exit:** the sheet renders all primitives in both registers, with no hardcoded colours anywhere.

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
