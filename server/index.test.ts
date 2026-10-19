import { test, expect, beforeAll, afterAll } from "bun:test";

const URL = "ws://localhost:3000";

let server: Bun.Subprocess;

beforeAll(async () => {
    server = Bun.spawn(["bun", "run", `${import.meta.dir}/index.ts`], {
        stdout: "ignore",
        stderr: "inherit",
    });

    // wait until the server accepts connections
    for (let i = 0; i < 50; i++) {
        try {
            await open();
            return;
        } catch {
            await Bun.sleep(50);
        }
    }
    throw new Error("server did not start");
});

afterAll(() => {
    server.kill();
});

// Wrap the open in a Promise so we wait until we get that
// connection before we proceed
function open(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(URL);
        ws.onopen = () => resolve(ws);
        ws.onerror = () => reject(new Error("connect failed"));
    });
}

// Sends a raw string, resolves with the first reply or null if none within `wait` ms.
async function send(raw: string, wait = 200): Promise<unknown | null> {
    const ws = await open();
    try {
        const reply = new Promise<unknown | null>((resolve) => {
            ws.onmessage = (e) => resolve(JSON.parse(e.data as string));
            setTimeout(() => resolve(null), wait);
        });
        ws.send(raw);
        return await reply;
    } finally {
        ws.close();
    }
}

test("null is rejected as a bad message", async () => {
    expect(await send("null")).toEqual({ type: "error", message: "bad message" });
});

test("a bare number is rejected as a bad message", async () => {
    expect(await send("5")).toEqual({ type: "error", message: "bad message" });
});

test("garbage is rejected as bad json", async () => {
    expect(await send("garbage")).toEqual({ type: "error", message: "bad json" });
});

test("a valid create_room is accepted without an error", async () => {
    const reply = await send(JSON.stringify({ type: "create_room", name: "dan" }));
    expect(reply).toBeNull();
});
