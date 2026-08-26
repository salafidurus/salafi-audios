const testFilePattern = /(?:\.spec|\.test|\.e2e)\.[cm]?[jt]sx?$/;
const skippedPattern = /\b(?:it|test|describe)\.skip\b|\b(?:xit|xdescribe)\b/;
const placeholderPattern = /expect\(\s*(?:true|false|null|undefined|["'`]\s*["'`])\s*\)/;
const criticalPattern = /\b(?:auth|permission|access|security|contract|regression|boundary|e2e)\b/i;

function withoutStringLiterals(source) {
  return source.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, " ");
}

export function isTestFile(file) {
  return testFilePattern.test(file);
}

export function normalizeTestSource(source) {
  return source
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyTestFile({ file, source }) {
  const executableSource = withoutStringLiterals(source);

  if (skippedPattern.test(executableSource)) {
    return {
      category: "permanently-skipped",
      confidence: "low",
      evidence: "The test source contains a skipped test declaration.",
      file,
      recommendation: "Confirm the skip is intentional before changing or removing it.",
    };
  }

  if (placeholderPattern.test(executableSource)) {
    return {
      category: "placeholder",
      confidence: "medium",
      evidence: "The test asserts a constant value rather than observed behavior.",
      file,
      recommendation: "Replace with a behavior assertion or remove after human review.",
    };
  }

  if (
    /\b(?:obsolete|deprecated|legacy)\b/i.test(executableSource) ||
    /(?:obsolete|deprecated|legacy)/i.test(file)
  ) {
    return {
      category: "obsolete",
      confidence: "low",
      evidence: "The test source or path explicitly describes obsolete or legacy behavior.",
      file,
      recommendation: "Verify the corresponding behavior is no longer supported.",
    };
  }

  if (criticalPattern.test(source) || criticalPattern.test(file)) {
    return {
      category: "critical-regression",
      confidence: "low",
      evidence:
        "The test name or source references an authorization, contract, boundary, or regression concern.",
      file,
      recommendation:
        "Preserve unless the protected behavior is intentionally removed and reviewed.",
    };
  }

  if (/\bexpect\s*\(/.test(source)) {
    return {
      category: "weak-but-meaningful",
      confidence: "low",
      evidence: "The test contains a non-placeholder expectation but was not otherwise classified.",
      file,
      recommendation: "Review assertion strength and retain if it protects meaningful behavior.",
    };
  }

  return {
    category: "unknown/dynamic",
    confidence: "low",
    evidence: "The test could not be classified conservatively from source text.",
    file,
    recommendation: "Human review required.",
  };
}
