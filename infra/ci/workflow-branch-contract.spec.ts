import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflowRoot = resolve(import.meta.dirname, "../../.github/workflows");

function workflow(name: string): string {
  return readFileSync(resolve(workflowRoot, name), "utf8");
}

function pullRequestTrigger(workflowText: string): string {
  const start = workflowText.indexOf("  pull_request:");
  const end = workflowText.indexOf("\npermissions:", start);

  if (start < 0 || end < 0) {
    throw new Error("Workflow does not define a pull_request trigger");
  }

  return workflowText.slice(start, end);
}

function branchesFor(workflowText: string): string[] {
  const branchList = pullRequestTrigger(workflowText).match(
    /^    branches:\s*\n((?:^      - .+\n?)+)/m,
  )?.[1];

  if (!branchList) {
    throw new Error("Workflow does not define a multiline branches list");
  }

  return [...branchList.matchAll(/^      - (.+)$/gm)]
    .map(([, branch]) => branch)
    .filter((branch): branch is string => branch !== undefined)
    .map((branch) => branch.replace(/\s+#.*$/, "").replace(/^['"]|['"]$/g, ""));
}

describe("specification pull-request validation contract", () => {
  it.each([
    "e2e-api.yml",
    "db-pr-test.yml",
    "docker-build.yml",
    "docker-verify.yml",
    "react-doctor.yml",
    "script-test.yml",
  ])("includes spec/** in %s without removing its existing targets", (name) => {
    const branches = branchesFor(workflow(name));

    expect(branches).toContain("spec/**");
    expect(branches).toContain("main");
  });

  it("keeps Docker validation from publishing images for specification PRs", () => {
    const dockerBuild = workflow("docker-build.yml");

    expect(dockerBuild).toContain("github.base_ref == 'preview'");
    expect(dockerBuild).toContain("Publication skipped; build and health validation completed.");
  });

  it("keeps deployment, promotion, and Dependabot synchronization release-gated", () => {
    const databaseDeployment = workflow("db-production.yml");
    const dockerDeployment = workflow("docker-deploy.yml");
    const dependabotSync = workflow("dependabot-sync.yml");

    expect(databaseDeployment).not.toContain("spec/**");
    expect(dockerDeployment).not.toContain("spec/**");
    expect(dependabotSync).not.toContain("spec/**");

    expect(databaseDeployment).toContain("      - preview # Preview environment deployments");
    expect(databaseDeployment).toContain("      - production # Production environment deployments");
    expect(dockerDeployment).toContain("      - preview");
    expect(dockerDeployment).toContain("      - production");
    expect(dependabotSync).toContain("    branches: [main]");
  });
});
