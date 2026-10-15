# Qlack

Monkeytype's feel, raced live against friends in private rooms.

*Q is the first key on a QWERTY keyboard.*

## Structure

- `engine/`: the typing engine. Pure TypeScript, shared by the server and the browser
- `server/`: Bun WebSocket server (coming soon)
- `web/`: Angular client (coming soon)

## Getting started

```bash
bun install
```

Run the engine tests:

```bash
cd engine
bun test
```