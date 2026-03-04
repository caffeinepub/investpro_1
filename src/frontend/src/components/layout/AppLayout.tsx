import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsAdmin, useUserProfile } from "@/hooks/useQueries";
import { getUserProfile, saveUserProfile } from "@/store/investmentStore";
import { getMobileSession } from "@/utils/mobileAuth";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  ChevronRight,
  Crown,
  History,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Share2,
  Shield,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: TrendingUp },
  { label: "Royal Pass", href: "/royal-pass", icon: Crown },
  { label: "Deposit", href: "/deposit", icon: ArrowDownCircle },
  { label: "Withdraw", href: "/withdraw", icon: ArrowUpCircle },
  { label: "Referrals", href: "/referrals", icon: Share2 },
  { label: "Transactions", href: "/transactions", icon: History },
  { label: "Bank Profile", href: "/bank-profile", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin Panel", href: "/admin", icon: Shield, adminOnly: true },
];

// The 5 bottom nav tabs (primary actions)
const BOTTOM_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: TrendingUp },
  { label: "Deposit", href: "/deposit", icon: ArrowDownCircle },
  { label: "Withdraw", href: "/withdraw", icon: ArrowUpCircle },
  { label: "History", href: "/transactions", icon: History },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "IP";

  // Retrieve the user's unique IP-XXXXX id for display
  const mobileUser = getMobileSession();
  const userProfile = mobileUser ? getUserProfile(mobileUser) : null;
  // If no profile yet, create one on the fly for display
  const displayUserId =
    userProfile?.userId ??
    (mobileUser ? saveUserProfile(mobileUser, {}).userId : null);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setSidebarOpen(false)}
        >
          <img
            src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
            alt="InvestPro"
            className="w-7 h-7 object-contain"
          />
          <div>
            <span className="font-display font-bold text-lg gold-text tracking-tight">
              InvestPro
            </span>
            <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
              Premium Investment Platform
            </p>
          </div>
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 group
                ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
              `}
            >
              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  item.href === "/royal-pass"
                    ? isActive
                      ? "text-amber-400"
                      : "text-amber-500/70 group-hover:text-amber-400"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                }`}
              />
              <span
                className="flex-1"
                style={
                  item.href === "/royal-pass"
                    ? {
                        background:
                          "linear-gradient(90deg, oklch(0.78 0.16 75), oklch(0.9 0.22 82))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontWeight: 700,
                      }
                    : undefined
                }
              >
                {item.label}
              </span>
              {isActive && item.href !== "/royal-pass" && (
                <ChevronRight className="w-3 h-3 text-primary opacity-60" />
              )}
              {item.adminOnly && (
                <Badge className="text-[9px] h-4 px-1 gold-gradient text-primary-foreground border-0 font-bold">
                  ADMIN
                </Badge>
              )}
              {item.href === "/royal-pass" && (
                <span
                  className="ml-auto text-[9px] font-bold border-0 px-1.5 py-0.5 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.78 0.16 75), oklch(0.85 0.2 78))",
                    color: "oklch(0.08 0.03 75)",
                  }}
                >
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User info + logout */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 border border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {profile?.name || "Investor"}
            </p>
            {displayUserId && (
              <p className="text-[9px] text-muted-foreground/70 font-mono tracking-wider mt-0.5">
                {displayUserId}
              </p>
            )}
            {isAdmin && (
              <Badge className="text-[9px] h-3.5 px-1 gold-gradient text-primary-foreground border-0 font-bold mt-0.5">
                ADMIN
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border sidebar-glow flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 w-72 h-full bg-sidebar border-r border-sidebar-border lg:hidden"
            >
              <button
                type="button"
                className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-3 py-2 bg-sidebar border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
              alt="InvestPro"
              className="w-6 h-6 object-contain"
            />
            <span className="font-display font-bold text-base gold-text">
              InvestPro
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6 border border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="More menu"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content -- extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)] lg:pb-0">
          <div className="lg:h-full pb-16 lg:pb-0">{children}</div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch">
            {BOTTOM_NAV.map((item) => {
              const isActive =
                currentPath === item.href ||
                currentPath.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 relative transition-colors"
                >
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gold-gradient"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
