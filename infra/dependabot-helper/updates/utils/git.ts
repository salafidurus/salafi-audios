import { spawnSync } from "child_process";

function git(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync("git", args, { encoding: "utf-8" });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

export function isClean(): boolean {
  const { stdout } = git(["status", "--porcelain"]);
  return stdout.trim().length === 0;
}

export function showDiff(): string {
  const { stdout } = git(["diff"]);
  return stdout;
}

export function commitChanges(message: string): boolean {
  const add = git(["add", "-A"]);
  if (add.status !== 0) return false;
  const commit = git(["commit", "-m", message]);
  return commit.status === 0;
}
