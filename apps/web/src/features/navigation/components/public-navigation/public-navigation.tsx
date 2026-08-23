"use client";

import { routes, type AppAbility } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import clsx from "clsx";
import {
  Bookmark,
  ArrowLeftRight,
  ChevronDown,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  Menu,
  Search,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { authClient, useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LanguageSwitch } from "@/features/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useResponsive } from "@/shared/hooks/use-responsive";

import {
  getAdminReturnPath,
  getBrowserStorage,
  rememberAdminReturnPath,
} from "../../utils/admin-workspace";
import styles from "./public-navigation.module.css";

type PublicNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

type AdminNavItem = PublicNavItem & {
  isVisible?: (ability: AppAbility) => boolean;
};

function getPublicNavItems(t: (key: string, fallback: string) => string): AdminNavItem[] {
  return [
    { label: t("navigation.home", "Home"), href: routes.home, Icon: Home },
    { label: t("navigation.explore", "Explore"), href: routes.explore.index, Icon: Compass },
    {
      label: t("navigation.scholars", "Scholars"),
      href: routes.scholars.index,
      Icon: GraduationCap,
    },
    { label: t("navigation.library", "Library"), href: routes.library.index, Icon: Bookmark },
    { label: t("navigation.settings", "Settings"), href: routes.settings.index, Icon: Settings2 },
  ];
}

function SearchControl() {
  const { t } = useTranslation();
  const router = useRouter();
  const label = t("navigation.searchAnything", "Search anything");

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push(routes.search);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={styles.searchControl}
      aria-label={label}
      onClick={() => router.push(routes.search)}
    >
      <Search aria-hidden="true" size={16} />
      <span>{label}</span>
      <kbd aria-hidden="true">⌘K</kbd>
    </Button>
  );
}

function WorkspaceSwitch({
  isAdminWorkspace,
  hasAdminAccess,
  returnPath,
}: {
  isAdminWorkspace: boolean;
  hasAdminAccess: boolean;
  returnPath: string;
}) {
  const { t } = useTranslation();
  const href = isAdminWorkspace ? returnPath : routes.admin.index;
  const label = isAdminWorkspace
    ? t("navigation.backToApp", "Back to App")
    : t("navigation.adminDashboard", "Admin Dashboard");

  if (!isAdminWorkspace && !hasAdminAccess) return null;

  return (
    <Link href={href} className={styles.workspaceSwitch}>
      <ArrowLeftRight aria-hidden="true" size={16} />
      {label}
    </Link>
  );
}

function getAdminNavItems(t: (key: string, fallback: string) => string): AdminNavItem[] {
  return [
    { label: t("navigation.admin.home", "Dashboard"), href: routes.admin.index, Icon: Home },
    { label: t("navigation.admin.stats", "Stats"), href: routes.admin.stats, Icon: BarChart3 },
    {
      label: t("navigation.admin.scholars", "Scholars"),
      href: routes.admin.scholars,
      Icon: GraduationCap,
      isVisible: (ability) => ability.can("read", "Scholar"),
    },
    {
      label: t("navigation.admin.contents", "Contents"),
      href: routes.admin.contents,
      Icon: Bookmark,
      isVisible: (ability) => ability.can("read", "Listing") || ability.can("read", "Topic"),
    },
    {
      label: t("navigation.admin.users", "Users"),
      href: routes.admin.users,
      Icon: Settings2,
      isVisible: (ability) => ability.can("manage", "UserAccess"),
    },
  ];
}

function isActivePath(pathname: string, href: string) {
  return href === routes.home || href === routes.admin.index
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({
  items,
  pathname,
  ariaLabel,
  isAdminWorkspace = false,
  onNavigate,
  closeWithSheet = false,
}: {
  items: AdminNavItem[];
  pathname: string;
  ariaLabel: string;
  isAdminWorkspace?: boolean;
  onNavigate?: () => void;
  closeWithSheet?: boolean;
}) {
  return (
    <nav className={clsx(styles.nav, isAdminWorkspace && styles.adminNav)} aria-label={ariaLabel}>
      {items.map(({ label, href, Icon }) => {
        const isActive = isActivePath(pathname, href);
        const link = (
          <Link
            key={href}
            href={href}
            className={clsx(styles.navLink, isActive && styles.active)}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" size={17} />
            <span>{label}</span>
          </Link>
        );

        return closeWithSheet ? (
          <SheetClose asChild key={href}>
            {link}
          </SheetClose>
        ) : (
          link
        );
      })}
    </nav>
  );
}

function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      // SAFETY: PointerEvent targets are DOM nodes when dispatched by the document.
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  if (isLoading) {
    return <span className={styles.accountLoading} aria-hidden="true" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href={routes.signIn}
        className={clsx(styles.accountControl, compact && styles.compactAccount)}
        aria-label={t("authStrip.signIn", "Sign In")}
      >
        <UserRound aria-hidden="true" size={18} />
        <span className={styles.compactAccountLabel}>{t("authStrip.signIn", "Sign In")}</span>
      </Link>
    );
  }

  const userInitial = (user.name || user.email || "?").charAt(0).toUpperCase();
  const closeMenu = () => setIsOpen(false);

  const signOut = async () => {
    closeMenu();
    try {
      await authClient.signOut();
    } finally {
      router.push(routes.home);
    }
  };

  return (
    <div ref={accountMenuRef} className={styles.accountMenu}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={clsx(
          styles.accountControl,
          styles.accountTrigger,
          compact && styles.compactAccount,
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`${t("navigation.account", "Account")}: ${user.name || user.email}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar size="default" aria-hidden="true">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        <span className={styles.accountName}>{user.name || user.email}</span>
        <ChevronDown aria-hidden="true" size={15} />
      </Button>
      {isOpen && (
        <div
          className={styles.accountPopover}
          role="menu"
          aria-label={t("navigation.account", "Account")}
        >
          <div className={styles.accountIdentity}>
            <strong>{user.name || t("account.defaultUser", "User")}</strong>
            <span>{user.email}</span>
          </div>
          <Link href={routes.settings.index} role="menuitem" onClick={closeMenu}>
            {t("navigation.settings", "Settings")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setIsSignOutDialogOpen(true);
            }}
          >
            {t("authStrip.signOut", "Sign Out")}
          </button>
        </div>
      )}
      <Modal.ConfirmDialog
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={signOut}
        title={t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}
        confirmLabel={t("account.signOut", "Sign Out")}
        confirmVariant="danger"
      />
    </div>
  );
}

function UtilityControls({
  hasAdminAccess,
  isAdminWorkspace,
  returnPath,
}: {
  hasAdminAccess: boolean;
  isAdminWorkspace: boolean;
  returnPath: string;
}) {
  return (
    <div className={styles.utilityControls}>
      <AccountMenu />
      <WorkspaceSwitch
        isAdminWorkspace={isAdminWorkspace}
        hasAdminAccess={hasAdminAccess}
        returnPath={returnPath}
      />
    </div>
  );
}

export function PublicNavigation() {
  const { t, i18n } = useTranslation();
  const { isMobile, isTablet } = useResponsive();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const isAdminWorkspace =
    pathname === routes.admin.index || pathname.startsWith(`${routes.admin.index}/`);
  const mainNavLabel = t("navigation.mainNav", "Main");
  const hasAdminAccess = isAuthenticated && hasAnyAdminAccess(ability);
  const [returnPath, setReturnPath] = useState<string>(routes.home);

  useEffect(() => {
    const storage = getBrowserStorage();
    if (isAdminWorkspace) {
      setReturnPath(getAdminReturnPath(storage));
      return;
    }

    rememberAdminReturnPath(pathname, storage);
    setReturnPath(pathname);
  }, [isAdminWorkspace, pathname]);

  const items = (isAdminWorkspace ? getAdminNavItems(t) : getPublicNavItems(t)).filter(
    (item) => !isAdminWorkspace || !item.isVisible || item.isVisible(ability),
  );
  const isCompact = isMobile || isTablet;
  const isRtl = i18n.dir() === "rtl";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href={isAdminWorkspace ? routes.admin.index : routes.home}
          className={styles.brand}
          aria-label={t("navigation.siteTitle", "Salafi Durus")}
        >
          <span className={styles.brandMark}>
            <Image src="/logo/logo_72.png" alt="" width={30} height={30} priority />
          </span>
          <span>{t("navigation.siteTitle", "Salafi Durus")}</span>
          {isAdminWorkspace && (
            <span className={styles.workspaceBadge}>{t("navigation.adminSection", "ADMIN")}</span>
          )}
        </Link>

        {isCompact ? (
          <div className={styles.mobileActions}>
            <SearchControl />
            <AccountMenu compact />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="surface" size="icon" aria-label={t("navigation.mainNav", "Main")}>
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "left" : "right"} className={styles.sheet}>
                <SheetHeader>
                  <SheetTitle>{t("navigation.siteTitle", "Salafi Durus")}</SheetTitle>
                  <LanguageSwitch direction="down" />
                </SheetHeader>
                {(isAdminWorkspace || hasAdminAccess) && (
                  <WorkspaceSwitch
                    isAdminWorkspace={isAdminWorkspace}
                    hasAdminAccess={hasAdminAccess}
                    returnPath={returnPath}
                  />
                )}
                <NavigationLinks
                  items={items}
                  pathname={pathname}
                  ariaLabel={mainNavLabel}
                  isAdminWorkspace={isAdminWorkspace}
                  closeWithSheet
                />
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className={styles.actions}>
            <NavigationLinks
              items={items}
              pathname={pathname}
              ariaLabel={mainNavLabel}
              isAdminWorkspace={isAdminWorkspace}
            />
            <div className={styles.rightActions}>
              <SearchControl />
              <UtilityControls
                hasAdminAccess={hasAdminAccess}
                isAdminWorkspace={isAdminWorkspace}
                returnPath={returnPath}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
