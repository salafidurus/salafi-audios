import type { AppAbility } from "@sd/core-contracts";

import { AbilityBuilder, createMongoAbility, subject } from "@casl/ability";
import { packRules } from "@casl/ability/extra";
import { describe, it, expect, vi, beforeEach } from "bun:test";

import { useAccountProfile } from "../../account.api";
import { buildAbilityFromRules, hasAnyAdminAccess, useAbility, useCan } from "./use-ability";

vi.mock("../../account.api", () => ({
  useAccountProfile: vi.fn(),
}));

/** Builds packed rules the same way the backend's ability factory would. */
function packedRulesFor(build: (can: AbilityBuilder<AppAbility>["can"]) => void) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);
  build(can);
  return packRules(rules);
}

describe("buildAbilityFromRules", () => {
  it("reconstructs an unconditioned global access rule", () => {
    const rules = packedRulesFor((can) => can("update", "Scholar"));
    const ability = buildAbilityFromRules(rules);

    expect(ability.can("update", "Scholar")).toBe(true);
    expect(ability.can("delete", "Scholar")).toBe(false);
  });

  it("reconstructs a scholar-scoped conditioned rule", () => {
    const rules = packedRulesFor((can) => can("update", "Listing", { scholarSlug: "scholar-a" }));
    const ability = buildAbilityFromRules(rules);

    expect(ability.can("update", subject("Listing", { scholarSlug: "scholar-a" }))).toBe(true);
    expect(ability.can("update", subject("Listing", { scholarSlug: "scholar-b" }))).toBe(false);
  });

  it("reconstructs a locale-scoped conditioned rule", () => {
    const rules = packedRulesFor((can) => can("publish", "Translation", { locale: "ar" }));
    const ability = buildAbilityFromRules(rules);

    expect(ability.can("publish", subject("Translation", { locale: "ar" }))).toBe(true);
    expect(ability.can("publish", subject("Translation", { locale: "en" }))).toBe(false);
  });

  it("reconstructs superadmin's manage-all rule", () => {
    const rules = packedRulesFor((can) => can("manage", "all"));
    const ability = buildAbilityFromRules(rules);

    expect(ability.can("delete", "Scholar")).toBe(true);
    expect(ability.can("manage", "all")).toBe(true);
  });

  it("produces an ability that can do nothing for an empty rule set", () => {
    const ability = buildAbilityFromRules([]);
    expect(ability.can("read", "Scholar")).toBe(false);
  });

  it("treats undefined the same as an empty rule set", () => {
    const ability = buildAbilityFromRules(undefined);
    expect(ability.can("read", "Scholar")).toBe(false);
  });
});

describe("useAbility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables the profile query when isAuthenticated is false", () => {
    (useAccountProfile as any).mockReturnValue({ data: undefined, isLoading: false, error: null });

    const result = useAbility({ isAuthenticated: false });

    expect(useAccountProfile).toHaveBeenCalledWith({ enabled: false });
    expect(result.isLoading).toBe(false);
    expect(result.ability.can("read", "Scholar")).toBe(false);
  });

  it("rebuilds the ability from the profile's packed rules", () => {
    const rules = packedRulesFor((can) => can("read", "Scholar"));
    (useAccountProfile as any).mockReturnValue({ data: { rules }, isLoading: false, error: null });

    const result = useAbility();

    expect(result.ability.can("read", "Scholar")).toBe(true);
    expect(result.ability.can("update", "Scholar")).toBe(false);
  });
});

describe("useCan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks an unconditioned action/subject pair", () => {
    const rules = packedRulesFor((can) => can("read", "Scholar"));
    (useAccountProfile as any).mockReturnValue({ data: { rules }, isLoading: false, error: null });

    expect(useCan("read", "Scholar")).toBe(true);
    expect(useCan("update", "Scholar")).toBe(false);
  });

  it("checks a conditioned action/subject pair", () => {
    const rules = packedRulesFor((can) => can("update", "Listing", { scholarSlug: "scholar-a" }));
    (useAccountProfile as any).mockReturnValue({ data: { rules }, isLoading: false, error: null });

    expect(useCan("update", "Listing", { scholarSlug: "scholar-a" })).toBe(true);
    expect(useCan("update", "Listing", { scholarSlug: "scholar-b" })).toBe(false);
  });
});

describe("hasAnyAdminAccess", () => {
  it("is true when the ability has any rule at all", () => {
    const ability = buildAbilityFromRules(packedRulesFor((can) => can("read", "Scholar")));
    expect(hasAnyAdminAccess(ability)).toBe(true);
  });

  it("is true for superadmin's manage-all rule", () => {
    const ability = buildAbilityFromRules(packedRulesFor((can) => can("manage", "all")));
    expect(hasAnyAdminAccess(ability)).toBe(true);
  });

  it("is false for an ability with no rules", () => {
    const ability = buildAbilityFromRules([]);
    expect(hasAnyAdminAccess(ability)).toBe(false);
  });
});
