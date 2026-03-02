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
import { Settings } from "@/pages/Settings";
import { Transactions } from "@/pages/Transactions";
import { Withdraw } from "@/pages/Withdraw";
import {
  getOrCreateShortCode,
  lookupUserByShortCode,
  registerWithReferral,
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
import { useEffect, useState } from "react";

// ── Guard components ──────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const [installDismissed, setInstallDismissed] = useState(false);
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
