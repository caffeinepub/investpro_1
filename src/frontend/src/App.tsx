import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useIsAdmin,
  useRegisterUserMeta,
  useUserProfile,
} from "@/hooks/useQueries";
import { Admin } from "@/pages/Admin";
import { BankProfile } from "@/pages/BankProfile";
import { Dashboard } from "@/pages/Dashboard";
import { Deposit } from "@/pages/Deposit";
import { Login } from "@/pages/Login";
import { Plans } from "@/pages/Plans";
import { Referrals } from "@/pages/Referrals";
import { Settings } from "@/pages/Settings";
import { Transactions } from "@/pages/Transactions";
import { Withdraw } from "@/pages/Withdraw";
import { registerWithReferral } from "@/store/investmentStore";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

// ── Guard components ──────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

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

  if (!identity) {
    return <Login />;
  }

  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Checking permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">Access Denied</p>
        <p className="text-muted-foreground text-sm mt-1">
          You don't have admin privileges.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function UserRegistrar() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const registerMeta = useRegisterUserMeta();
  const principalStr = identity?.getPrincipal().toString();
  const { mutate } = registerMeta;

  useEffect(() => {
    if (identity && profile?.name && principalStr) {
      mutate({ userId: principalStr, name: profile.name });

      // Apply pending referral code if any
      const pendingRef = sessionStorage.getItem("pending_referral");
      if (pendingRef && pendingRef !== principalStr) {
        registerWithReferral(principalStr, pendingRef);
        sessionStorage.removeItem("pending_referral");
      }
    }
  }, [identity, profile?.name, principalStr, mutate]);

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
    <AdminGuard>
      <Admin />
    </AdminGuard>
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
