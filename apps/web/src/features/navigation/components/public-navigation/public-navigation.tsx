"use client";

import { routes, type AppAbility } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import clsx from "clsx";
import {
  Bookmark,
  ArrowLeft,
  ChevronDown,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  LayoutDashboard,
  LibraryBig,
  Menu,
  UsersRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/core/auth";
import { useSignOut } from "@/core/auth/use-sign-out";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthModal } from "@/features/auth";
import { LanguageSwitch } from "@/features/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
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
import { CommandPalette } from "../command-palette/command-palette";
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
    {
      label: t("navigation.myLibrary", "My Library"),
      href: routes.myLibrary.index,
      Icon: Bookmark,
    },
  ];
}

function SearchControl() {
  return <CommandPalette />;
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
      {isAdminWorkspace ? (
        <ArrowLeft aria-hidden="true" size={16} />
      ) : (
        <LayoutDashboard aria-hidden="true" size={16} />
      )}
      {label}
    </Link>
  );
}

function getAdminNavItems(t: (key: string, fallback: string) => string): AdminNavItem[] {
  return [
    {
      label: t("navigation.admin.home", "Home"),
      href: routes.admin.index,
      Icon: LayoutDashboard,
    },
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
      Icon: LibraryBig,
      isVisible: (ability) => ability.can("read", "Listing") || ability.can("read", "Topic"),
    },
    {
      label: t("navigation.admin.users", "Users"),
      href: routes.admin.users,
      Icon: UsersRound,
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
      {items.map(({ label, href }) => {
        const isActive = isActivePath(pathname, href);
        const link = (
          <Link
            key={href}
            href={href}
            className={clsx(styles.navLink, isActive && styles.active)}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
          >
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

type AccountMenuBaseProps = {
  compact: boolean;
  isOpen: boolean;
  closeMenu: () => void;
  toggleMenu: () => void;
};

function GuestAccountMenu({
  compact,
  isOpen,
  closeMenu,
  toggleMenu,
  isAuthModalOpen,
  openAuthModal,
  closeAuthModal,
  accountMenuRef,
}: AccountMenuBaseProps & {
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  accountMenuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();

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
        aria-label={`${t("navigation.account", "Account")}: ${t("account.guest", "Guest")}`}
        onClick={toggleMenu}
      >
        <UserRound aria-hidden="true" size={18} />
        <span className={styles.accountName}>{t("account.guest", "Guest")}</span>
        <ChevronDown aria-hidden="true" size={15} />
      </Button>
      {isOpen && (
        <div
          className={styles.accountPopover}
          role="menu"
          aria-label={t("navigation.account", "Account")}
        >
          <Link href={routes.settings.index} role="menuitem" onClick={closeMenu}>
            {t("navigation.settings", "Settings")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              openAuthModal();
            }}
          >
            {t("authStrip.signIn", "Sign In")}
          </button>
        </div>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}

type AuthenticatedAccountMenuProps = AccountMenuBaseProps & {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  openSignOutDialog: () => void;
  accountMenuRef: React.RefObject<HTMLDivElement | null>;
};

function AuthenticatedAccountMenu({
  compact,
  isOpen,
  closeMenu,
  toggleMenu,
  user,
  openSignOutDialog,
  accountMenuRef,
}: AuthenticatedAccountMenuProps) {
  const { t } = useTranslation();
  const userInitial = (user.name || user.email || "?").charAt(0).toUpperCase();

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
        onClick={toggleMenu}
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
              openSignOutDialog();
            }}
          >
            {t("authStrip.signOut", "Sign Out")}
          </button>
        </div>
      )}
    </div>
  );
}

function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { signOut: performSignOut, error: signOutError } = useSignOut();

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

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((open) => !open);
  const signOut = async () => {
    closeMenu();
    await performSignOut();
  };

  if (isLoading) return <span className={styles.accountLoading} aria-hidden="true" />;
  if (!isAuthenticated || !user) {
    return (
      <GuestAccountMenu
        compact={compact}
        isOpen={isOpen}
        closeMenu={closeMenu}
        toggleMenu={toggleMenu}
        isAuthModalOpen={isAuthModalOpen}
        openAuthModal={() => setIsAuthModalOpen(true)}
        closeAuthModal={() => setIsAuthModalOpen(false)}
        accountMenuRef={accountMenuRef}
      />
    );
  }

  return (
    <>
      <AuthenticatedAccountMenu
        compact={compact}
        isOpen={isOpen}
        closeMenu={closeMenu}
        toggleMenu={toggleMenu}
        user={user}
        openSignOutDialog={() => setIsSignOutDialogOpen(true)}
        accountMenuRef={accountMenuRef}
      />
      <ConfirmationDialog
        open={isSignOutDialogOpen}
        onOpenChange={setIsSignOutDialogOpen}
        onConfirm={signOut}
        title={t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}
        confirmLabel={t("account.signOut", "Sign Out")}
        variant="destructive"
        error={signOutError}
      />
    </>
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
  const { isMobile } = useResponsive();
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
  const isCompact = isMobile;
  const isRtl = i18n.dir() === "rtl";

  return (
    <header className={styles.header}>
      <div className={clsx(styles.inner, isAdminWorkspace && styles.adminInner)}>
        <Link
          href={isAdminWorkspace ? routes.admin.index : routes.home}
          className={styles.brand}
          aria-label={t("navigation.siteTitle", "Salafi Durus")}
        >
          <span className={styles.brandMark}>
            <Image src="/logo/logo_72.png" alt="" width={30} height={30} priority />
          </span>
          <span className={styles.brandName}>{t("navigation.siteTitle", "Salafi Durus")}</span>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.menuTrigger}
                  aria-label={t("navigation.mainNav", "Main")}
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "left" : "right"} className={styles.sheet}>
                <SheetHeader className={styles.sheetHeader}>
                  <div className={styles.sheetBrand}>
                    <span className={styles.sheetBrandMark} aria-hidden="true">
                      <Image src="/logo/logo_72.png" alt="" width={24} height={24} />
                    </span>
                    <div className={styles.sheetHeading}>
                      <SheetTitle>{t("navigation.siteTitle", "Salafi Durus")}</SheetTitle>
                      <SheetDescription>
                        {t("navigation.mobileDescription", "Navigate your study space")}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <div className={styles.sheetNavigation}>
                  {isAdminWorkspace && (
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
                </div>
                <div className={styles.sheetLanguage}>
                  <LanguageSwitch direction="down" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className={styles.actions}>
            <div className={styles.searchSlot}>
              <SearchControl />
            </div>
            <NavigationLinks
              items={items}
              pathname={pathname}
              ariaLabel={mainNavLabel}
              isAdminWorkspace={isAdminWorkspace}
            />
            <div className={styles.rightActions}>
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
