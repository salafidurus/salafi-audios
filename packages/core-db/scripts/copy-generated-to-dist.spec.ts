import { expect, it } from "bun:test";

const scriptPath = new URL("./generate-prisma.js", import.meta.url).pathname;

it("allows concurrent Prisma generation and generated-client publication", async () => {
  const processes = Array.from({ length: 8 }, () =>
    Bun.spawn([process.execPath, scriptPath], {
      stderr: "pipe",
      stdout: "pipe",
    }),
  );

  const exitCodes = await Promise.all(processes.map((process) => process.exited));

  expect(exitCodes).toEqual(Array.from({ length: 8 }, () => 0));
}, 30_000);
