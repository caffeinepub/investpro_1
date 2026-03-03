import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useRegisterUserMeta, useUserProfile } from "@/hooks/useQueries";
import { Admin } from "@/pages/Admin";
import { BankProfile } from "@/pages/BankProfile";
import { Dashboard } from "@/pages/Dashboard";
import { Deposit } from "@/pages/Deposit";
import { InstallApp, shouldShowInstallScreen } from "@/pages/InstallApp";
import { Login } from "@/pages/Login";
import { Plans } from "@/pages/Plans";
import { Referrals } from "@/pages/Referrals";
import { RoyalPass } from "@/pages/RoyalPass";
import { Settings } from "@/pages/Settings";
import { Transactions } from "@/pages/Transactions";
import { Withdraw } from "@/pages/Withdraw";
import {
  getOrCreateShortCode,
  getUserTier,
  loadUserData,
  lookupUserByShortCode,
  registerWithReferral,
  saveUserProfile,
} from "@/store/investmentStore";
import { getMobileSession } from "@/utils/mobileAuth";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Crown, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useState as useDiscState } from "react";
import { useEffect, useState } from "react";

// ── Disclaimer Modal ──────────────────────────────────────────

const DISCLAIMER_KEY = "investpro_disclaimer_v1";

function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useDiscState(false);

  const points = [
    {
      icon: Smartphone,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      title: "Do Not Uninstall",
      desc: "Keep the InvestPro app installed on your device. Uninstalling will interrupt your active investment plans and daily ROI claims.",
    },
    {
      icon: Lock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      title: "Stay Logged In",
      desc: "Do not log out from the app. Your investment data is linked to this device and session — logging out may affect access to your funds.",
    },
    {
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      title: "Your Funds Are Protected",
      desc: "All investments are secured on the blockchain. Your balance, ROI earnings, and withdrawal history are always safe and verifiable.",
    },
    {
      icon: Crown,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      title: "Grow With Confidence",
      desc: "We are committed to delivering your daily returns and processing withdrawals on time. Trust the platform — it works for you 24/7.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.1 0.03 285), oklch(0.08 0.02 75))",
          border: "1px solid oklch(0.78 0.16 75 / 0.25)",
          boxShadow: "0 0 60px oklch(0.78 0.16 75 / 0.12)",
        }}
      >
        {/* Gold top bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.6 0.18 75), oklch(0.85 0.22 82), oklch(0.6 0.18 75))",
          }}
        />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div
              className="inline-flex p-3 rounded-2xl mb-1"
              style={{
                background: "oklch(0.78 0.16 75 / 0.12)",
                border: "1px solid oklch(0.78 0.16 75 / 0.25)",
              }}
            >
              <Crown
                className="w-7 h-7"
                style={{ color: "oklch(0.85 0.22 82)" }}
              />
            </div>
            <h2
              className="font-display text-xl font-bold"
              style={{ color: "oklch(0.88 0.18 80)" }}
            >
              Welcome to InvestPro
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Before you begin investing, please read these important guidelines
              to protect your funds and get the best experience.
            </p>
          </div>

          {/* Points */}
          <div className="space-y-3">
            {points.map((pt) => {
              const Icon = pt.icon;
              return (
                <div
                  key={pt.title}
                  className={`flex gap-3 p-3 rounded-xl border ${pt.bg}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${pt.color}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${pt.color}`}>
                      {pt.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
              I have read and understood all the guidelines above. I will keep
              the app installed and stay logged in to protect my investments.
            </p>
          </label>

          {/* CTA */}
          <Button
            onClick={onAccept}
            disabled={!checked}
            className="w-full h-12 font-bold text-base border-0 disabled:opacity-40"
            style={{
              background: checked
                ? "linear-gradient(135deg, oklch(0.6 0.18 75), oklch(0.78 0.22 82))"
                : undefined,
              color: checked ? "oklch(0.08 0.03 75)" : undefined,
            }}
          >
            <Crown className="w-4 h-4 mr-2" />I Understand &amp; Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Guard components ──────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const [installDismissed, setInstallDismissed] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    () => localStorage.getItem(DISCLAIMER_KEY) === "true",
  );
  const mobileUser = getMobileSession();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <img
            src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
            alt="InvestPro"
            className="w-12 h-12 object-contain mx-auto animate-pulse-gold"
          />
          <p className="text-sm text-muted-foreground">Loading InvestPro...</p>
        </div>
      </div>
    );
  }

  if (!identity && !mobileUser) {
    return <Login />;
  }

  // Show disclaimer once per device after first login
  if (!disclaimerAccepted) {
    return (
      <>
        {children}
        <DisclaimerModal
          onAccept={() => {
            localStorage.setItem(DISCLAIMER_KEY, "true");
            setDisclaimerAccepted(true);
          }}
        />
      </>
    );
  }

  // After a fresh sign-in (loginStatus === "success" for Internet Identity) or mobile login,
  // show install screen once per device
  const isNewLogin = loginStatus === "success" || !!mobileUser;
  if (isNewLogin && !installDismissed && shouldShowInstallScreen()) {
    return <InstallApp onContinue={() => setInstallDismissed(true)} />;
  }

  return <>{children}</>;
}

function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("adminAuth") === "true",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (authed) return <>{children}</>;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      sessionStorage.setItem("adminAuth", "true");
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border shadow-2xl">
        <CardHeader className="items-center pb-4 pt-8">
          <img
            src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
            alt="InvestPro"
            className="w-14 h-14 object-contain mb-3"
          />
          <CardTitle className="text-xl font-semibold text-foreground">
            Admin Panel
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your admin password to continue
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="bg-input border-border"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UserRegistrar() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const registerMeta = useRegisterUserMeta();
  const principalStr = identity?.getPrincipal().toString();
  const mobileUser = getMobileSession();
  const effectiveUserId = principalStr || mobileUser || null;
  const { mutate } = registerMeta;

  useEffect(() => {
    if (effectiveUserId) {
      // For mobile users, use mobile number as name if no profile
      const displayName =
        profile?.name || (mobileUser ? `User ${mobileUser}` : effectiveUserId);
      mutate({ userId: effectiveUserId, name: displayName });

      // Save/update persistent user profile for mobile users
      if (mobileUser) {
        const userData = loadUserData(effectiveUserId);
        const tier = getUserTier(userData.investments);
        saveUserProfile(mobileUser, { displayName, tier });
      }

      // Ensure user's own short code is created
      getOrCreateShortCode(effectiveUserId);

      // Apply pending referral code if any
      const pendingRef = sessionStorage.getItem("pending_referral");
      if (pendingRef && pendingRef !== effectiveUserId) {
        // Try to resolve short code first (short codes are <= 8 chars)
        const resolvedRef =
          pendingRef.length <= 8
            ? lookupUserByShortCode(pendingRef)
            : pendingRef;
        const finalRef = resolvedRef || pendingRef;
        if (finalRef !== effectiveUserId) {
          registerWithReferral(effectiveUserId, finalRef);
        }
        sessionStorage.removeItem("pending_referral");
      }
    }
  }, [effectiveUserId, profile?.name, mobileUser, mutate]);

  // On first load, capture ?ref= param before login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("pending_referral", ref);
    }
  }, []);

  return null;
}

// ── Layout wrapper ────────────────────────────────────────────

function ProtectedLayout() {
  return (
    <AuthGuard>
      <UserRegistrar />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  );
}

// ── Routes ────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            color: "oklch(var(--foreground))",
          },
        }}
      />
    </>
  ),
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: Dashboard,
});

const plansRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/plans",
  component: Plans,
});

const depositRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/deposit",
  component: Deposit,
});

const withdrawRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/withdraw",
  component: Withdraw,
});

const bankProfileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/bank-profile",
  component: BankProfile,
});

const transactionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/transactions",
  component: Transactions,
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/admin",
  component: () => (
    <AdminPasswordGate>
      <Admin />
    </AdminPasswordGate>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: Settings,
});

const referralsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/referrals",
  component: Referrals,
});

const royalPassRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/royal-pass",
  component: RoyalPass,
});

const routeTree = rootRoute.addChildren([
  protectedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    plansRoute,
    depositRoute,
    withdrawRoute,
    bankProfileRoute,
    transactionsRoute,
    adminRoute,
    settingsRoute,
    referralsRoute,
    royalPassRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
