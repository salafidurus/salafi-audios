import { expect, it } from "bun:test";

const scriptPath = new URL("./copy-generated-to-dist.js", import.meta.url).pathname;

it("allows concurrent generated-client publication", async () => {
  const processes = Array.from({ length: 16 }, () =>
    Bun.spawn([process.execPath, scriptPath], {
      stderr: "pipe",
      stdout: "pipe",
    }),
  );

  const exitCodes = await Promise.all(processes.map((process) => process.exited));

  expect(exitCodes).toEqual(Array.from({ length: 16 }, () => 0));
});
