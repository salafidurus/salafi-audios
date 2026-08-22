"use client";

import { routes } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import clsx from "clsx";
import {
  Bookmark,
  ChevronDown,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  Menu,
  Search,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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

import styles from "./public-navigation.module.css";

type PublicNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

function getPublicNavItems(t: (key: string, fallback: string) => string): PublicNavItem[] {
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

  return (
    <Link href={routes.search} className={styles.searchControl}>
      <Search aria-hidden="true" size={16} />
      {t("authStrip.search", "Search")}
    </Link>
  );
}

function getAdminNavItems(t: (key: string, fallback: string) => string): PublicNavItem[] {
  return [
    { label: t("navigation.admin.home", "Dashboard"), href: routes.admin.index, Icon: Home },
    { label: t("navigation.admin.stats", "Stats"), href: routes.admin.stats, Icon: BarChart3 },
    {
      label: t("navigation.admin.scholars", "Scholars"),
      href: routes.admin.scholars,
      Icon: GraduationCap,
    },
    {
      label: t("navigation.admin.contents", "Contents"),
      href: routes.admin.contents,
      Icon: Bookmark,
    },
    { label: t("navigation.admin.users", "Users"), href: routes.admin.users, Icon: Settings2 },
  ];
}

function isActivePath(pathname: string, href: string) {
  return href === routes.home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({
  items,
  pathname,
  ariaLabel,
  onNavigate,
  closeWithSheet = false,
}: {
  items: PublicNavItem[];
  pathname: string;
  ariaLabel: string;
  onNavigate?: () => void;
  closeWithSheet?: boolean;
}) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
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

function AccountMenu({ hasAdminAccess }: { hasAdminAccess: boolean }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  if (isLoading) {
    return <span className={styles.accountLoading} aria-hidden="true" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href={routes.signIn} className={styles.accountControl}>
        {t("authStrip.signIn", "Sign In")}
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
    <div className={styles.accountMenu}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={clsx(styles.accountControl, styles.accountTrigger)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("navigation.account", "Account")}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar size="sm" aria-hidden="true">
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
          {hasAdminAccess && (
            <Link href={routes.admin.index} role="menuitem" onClick={closeMenu}>
              {t("navigation.adminWorkspace", "Admin workspace")}
            </Link>
          )}
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

export function PublicNavigation() {
  const { t, i18n } = useTranslation();
  const { isMobile, isTablet } = useResponsive();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const isAdminWorkspace =
    pathname === routes.admin.index || pathname.startsWith(`${routes.admin.index}/`);
  const items = isAdminWorkspace ? getAdminNavItems(t) : getPublicNavItems(t);
  const mainNavLabel = t("navigation.mainNav", "Main");
  const hasAdminAccess = isAuthenticated && hasAnyAdminAccess(ability);

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
        </Link>

        {isCompact ? (
          <div className={styles.mobileActions}>
            <SearchControl />
            <AccountMenu hasAdminAccess={hasAdminAccess} />
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
                {isAdminWorkspace && (
                  <Link className={styles.backToApp} href={routes.home}>
                    {t("navigation.backToApp", "Back to app")}
                  </Link>
                )}
                <NavigationLinks
                  items={items}
                  pathname={pathname}
                  ariaLabel={mainNavLabel}
                  closeWithSheet
                />
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <>
            {isAdminWorkspace && (
              <Link className={styles.backToApp} href={routes.home}>
                {t("navigation.backToApp", "Back to app")}
              </Link>
            )}
            <NavigationLinks items={items} pathname={pathname} ariaLabel={mainNavLabel} />
            <SearchControl />
            <AccountMenu hasAdminAccess={hasAdminAccess} />
          </>
        )}
      </div>
    </header>
  );
}
