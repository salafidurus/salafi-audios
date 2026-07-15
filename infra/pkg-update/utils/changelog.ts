const npmRepoCache = new Map<string, Promise<string | null>>();

export function clearChangelogCache(): void {
  npmRepoCache.clear();
}

function stripRepoUrl(url: string): string {
  return url.replace(/^git\+/, "").replace(/\.git$/, "");
}

function isGitHubUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "github.com";
  } catch {
    return /(?:^|[/@])github\.com[:/]/.test(url);
  }
}

async function fetchNpmRepoUrl(packageName: string): Promise<string | null> {
  const cached = npmRepoCache.get(packageName);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        repository?: { url?: string };
      };
      const rawUrl = data.repository?.url;
      if (!rawUrl) return null;
      return stripRepoUrl(rawUrl);
    } catch {
      return null;
    }
  })();

  npmRepoCache.set(packageName, promise);
  return promise;
}

async function fetchGitCompareUrl(
  repoUrl: string,
  fromVersion: string,
  toVersion: string,
  token?: string,
): Promise<string | null> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) return null;

  const owner = match[1]!;
  const repo = match[2]!;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/v${fromVersion}...v${toVersion}`,
      { headers },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      commits?: Array<{ commit?: { message?: string } }>;
      html_url?: string;
    };
    const commits = data.commits ?? [];
    if (commits.length === 0) return null;

    const lines: string[] = [];
    for (const c of commits.slice(0, 20)) {
      const msg = c.commit?.message?.split("\n")[0];
      if (msg) lines.push(`- ${msg}`);
    }
    if (commits.length > 20) {
      lines.push(`- ... and ${commits.length - 20} more commits`);
    }

    const compareUrl =
      data.html_url ??
      `https://github.com/${owner}/${repo}/compare/v${fromVersion}...v${toVersion}`;
    lines.push("", `Compare: ${compareUrl}`);
    return lines.join("\n");
  } catch {
    return null;
  }
}

async function fetchGitHubCompareUrl(
  packageName: string,
  fromVersion: string,
  toVersion: string,
  token?: string,
): Promise<string | null> {
  const repoUrl = await fetchNpmRepoUrl(packageName);
  if (!repoUrl) return null;

  if (isGitHubUrl(repoUrl)) {
    const compareResult = await fetchGitCompareUrl(repoUrl, fromVersion, toVersion, token);
    if (compareResult) return compareResult;
  }

  const path = repoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return [`Changes: ${path}/compare/v${fromVersion}...v${toVersion}`].join("\n");
}

export async function buildChangelogSection(
  packageName: string,
  fromVersion: string,
  toVersion: string,
  token?: string,
): Promise<string> {
  const lines: string[] = [`### ${packageName} — ${fromVersion} → ${toVersion}`];
  lines.push("");

  const repoUrl = await fetchNpmRepoUrl(packageName);
  const path = repoUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (repoUrl && isGitHubUrl(repoUrl)) {
    const compareContent = await fetchGitCompareUrl(repoUrl, fromVersion, toVersion, token);
    if (compareContent) {
      lines.push(compareContent);
      return lines.join("\n");
    }
    const cleanUrl = stripRepoUrl(repoUrl);
    lines.push(`Compare: ${cleanUrl}/compare/v${fromVersion}...v${toVersion}`);
    return lines.join("\n");
  }

  const npmUrl = `https://www.npmjs.com/package/${encodeURIComponent(packageName)}/v/${toVersion}`;
  lines.push(`View: ${npmUrl}`);

  return lines.join("\n");
}
