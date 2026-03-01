import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddNotice,
  useAllUsersData,
  useApproveDeposit,
  useApproveWithdrawal,
  useBroadcastNotices,
  useDeleteNotice,
  useGlobalDeposits,
  useGlobalWithdrawals,
  usePlanOverrides,
  usePlatformSettings,
  useRejectDeposit,
  useRejectWithdrawal,
  useSavePlanOverride,
  useSavePlatformSettings,
} from "@/hooks/useQueries";
import { notifyWhatsApp } from "@/lib/whatsappNotify";
import { INVESTMENT_PLANS, formatINR } from "@/store/investmentStore";
import type { PlanOverride } from "@/store/platformStore";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  Megaphone,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type RequestStatus = "Pending" | "Approved" | "Rejected";

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "Pending")
    return (
      <Badge className="bg-warning/15 text-warning border-warning/30 text-xs gap-1 shrink-0">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  if (status === "Approved")
    return (
      <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/30 text-xs gap-1 shrink-0">
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs gap-1 shrink-0">
      <XCircle className="w-3 h-3" />
      Rejected
    </Badge>
  );
}

// ── Tab: Overview ────────────────────────────────────────────

function OverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { data: withdrawals = [] } = useGlobalWithdrawals();
  const { data: deposits = [] } = useGlobalDeposits();
  const { data: users = [] } = useAllUsersData();

  const totalUsers = users.length;
  const totalFunds = users.reduce(
    (sum, u) =>
      sum +
      u.data.wallet.balance +
      u.data.wallet.totalWithdrawn +
      u.data.investments.reduce((s, inv) => s + inv.amountInvested, 0),
    0,
  );
  const pendingDepositsCount = deposits.filter(
    (d) => d.status === "Pending",
  ).length;
  const pendingWithdrawalsCount = withdrawals.filter(
    (w) => w.status === "Pending",
  ).length;
  const pendingTotal = pendingDepositsCount + pendingWithdrawalsCount;
  const totalROIPaid = users.reduce(
    (sum, u) => sum + u.data.wallet.totalROIEarned,
    0,
  );
  const activeInvestmentsCount = users.reduce(
    (sum, u) =>
      sum + u.data.investments.filter((i) => i.status === "Active").length,
    0,
  );
  const totalWithdrawn = users.reduce(
    (sum, u) => sum + u.data.wallet.totalWithdrawn,
    0,
  );

  const recentActivity = [
    ...deposits.slice(0, 20).map((d) => ({
      id: d.id,
      type: "Deposit" as const,
      userName: d.userName,
      amount: d.amount,
      status: d.status,
      timestamp: d.requestedAt,
    })),
    ...withdrawals.slice(0, 20).map((w) => ({
      id: w.id,
      type: "Withdrawal" as const,
      userName: w.userName,
      amount: w.amount,
      status: w.status,
      timestamp: w.requestedAt,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const statCards = [
    {
      label: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      isWarning: false,
    },
    {
      label: "Total Funds",
      value: formatINR(totalFunds),
      icon: ArrowDownCircle,
      color: "text-primary",
      bg: "bg-primary/10",
      isWarning: false,
    },
    {
      label: "Pending Requests",
      value: pendingTotal.toString(),
      icon: AlertCircle,
      color: pendingTotal > 0 ? "text-warning" : "text-muted-foreground",
      bg: pendingTotal > 0 ? "bg-warning/10" : "bg-secondary/30",
      isWarning: pendingTotal > 0,
    },
    {
      label: "Total ROI Paid",
      value: formatINR(totalROIPaid),
      icon: TrendingUp,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
      isWarning: false,
    },
    {
      label: "Active Investments",
      value: activeInvestmentsCount.toString(),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      isWarning: false,
    },
    {
      label: "Total Withdrawn",
      value: formatINR(totalWithdrawn),
      icon: ArrowUpCircle,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
      isWarning: false,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AnimatePresence>
        {pendingTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5"
          >
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-warning/15 rounded-md">
                    <AlertCircle className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warning">
                      {pendingTotal} pending request
                      {pendingTotal !== 1 ? "s" : ""} need attention
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pendingDepositsCount > 0 &&
                        `${pendingDepositsCount} deposit${pendingDepositsCount !== 1 ? "s" : ""}`}
                      {pendingDepositsCount > 0 &&
                        pendingWithdrawalsCount > 0 &&
                        " · "}
                      {pendingWithdrawalsCount > 0 &&
                        `${pendingWithdrawalsCount} withdrawal${pendingWithdrawalsCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {pendingDepositsCount > 0 && (
                    <Button
                      size="sm"
                      className="bg-warning/15 text-warning hover:bg-warning/25 border-warning/30 border h-8 text-xs"
                      onClick={() => onTabChange("deposits")}
                    >
                      Review Deposits
                    </Button>
                  )}
                  {pendingWithdrawalsCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-warning/30 text-warning hover:bg-warning/10 h-8 text-xs"
                      onClick={() => onTabChange("withdrawals")}
                    >
                      Review Withdrawals
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card
                className={`border-border/50 relative overflow-hidden stat-card-shine ${stat.isWarning ? "border-warning/20" : ""}`}
              >
                <CardContent className="p-5">
                  <div className={`p-2 ${stat.bg} rounded-lg w-fit mb-3`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className={`font-display font-bold text-xl ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No activity yet
            </p>
          ) : (
            <div className="space-y-0">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-md flex-shrink-0 ${item.type === "Deposit" ? "bg-primary/10" : "bg-chart-5/10"}`}
                    >
                      {item.type === "Deposit" ? (
                        <ArrowDownCircle className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-chart-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        {formatINR(item.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Deposits ────────────────────────────────────────────

function DepositsTab() {
  const { data: deposits = [], isLoading } = useGlobalDeposits();
  const approveDepositMutation = useApproveDeposit();
  const rejectDepositMutation = useRejectDeposit();
  const [filter, setFilter] = useState<"All" | RequestStatus>("All");
  const [search, setSearch] = useState("");
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(
    null,
  );

  const filtered = deposits.filter((d) => {
    const matchFilter = filter === "All" || d.status === filter;
    const matchSearch =
      !search ||
      d.userName.toLowerCase().includes(search.toLowerCase()) ||
      d.utr.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function handleApproveDeposit(
    id: string,
    userId: string,
    amount: number,
    utr: string,
  ) {
    try {
      await approveDepositMutation.mutateAsync(id);
      notifyWhatsApp(
        `DEPOSIT APPROVED\nUser: ${userId}\nAmount: ₹${amount}\nUTR: ${utr}\nWallet credited.`,
      );
      toast.success("Deposit approved — wallet credited");
    } catch {
      toast.error("Failed to approve deposit");
    }
  }

  async function handleRejectDeposit(id: string) {
    try {
      await rejectDepositMutation.mutateAsync(id);
      notifyWhatsApp(`DEPOSIT REJECTED\nRequest ID: ${id}`);
      toast.success("Deposit request rejected");
    } catch {
      toast.error("Failed to reject deposit");
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by name or UTR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary/30 border-border/50 text-sm h-9"
        />
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className={`h-9 text-xs px-3 ${filter === f ? "bg-primary text-primary-foreground" : "border-border/50"}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({deposits.filter((d) => d.status === f).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <ArrowDownCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">
              No deposit requests found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <motion.div
              key={req.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`border-border/50 ${req.status === "Pending" ? "border-warning/20" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-foreground">
                          {req.userName}
                        </p>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold text-primary">
                            {formatINR(req.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">UTR / Ref</p>
                          <p className="font-mono text-foreground break-all">
                            {req.utr}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested</p>
                          <p>
                            {new Date(req.requestedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">User ID</p>
                          <p className="font-mono truncate">
                            {req.userId.slice(0, 12)}…
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {req.screenshotDataUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedScreenshot(req.screenshotDataUrl)
                          }
                          className="rounded-lg overflow-hidden border border-border/40 hover:border-primary/40 transition-colors w-20 h-16 flex-shrink-0"
                          title="View screenshot"
                        >
                          <img
                            src={req.screenshotDataUrl}
                            alt="Payment proof"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                      {req.status === "Pending" && (
                        <div className="flex flex-col gap-1.5">
                          <Button
                            size="sm"
                            className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-chart-2/30 border h-8 text-xs gap-1.5"
                            onClick={() =>
                              handleApproveDeposit(
                                req.id,
                                req.userId,
                                req.amount,
                                req.utr,
                              )
                            }
                            disabled={approveDepositMutation.isPending}
                          >
                            {approveDepositMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10 h-8 text-xs gap-1.5"
                            onClick={() => handleRejectDeposit(req.id)}
                            disabled={rejectDepositMutation.isPending}
                          >
                            {rejectDepositMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {expandedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setExpandedScreenshot(null)}
          >
            <div className="relative max-w-lg w-full">
              <img
                src={expandedScreenshot}
                alt="Payment proof"
                className="w-full rounded-xl"
              />
              <button
                type="button"
                onClick={() => setExpandedScreenshot(null)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Tab: Withdrawals ─────────────────────────────────────────

function WithdrawalsTab() {
  const { data: withdrawals = [], isLoading } = useGlobalWithdrawals();
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();
  const [filter, setFilter] = useState<"All" | RequestStatus>("All");
  const [search, setSearch] = useState("");
  const [revealedAccounts, setRevealedAccounts] = useState<Set<string>>(
    new Set(),
  );

  const filtered = withdrawals.filter((w) => {
    const matchFilter = filter === "All" || w.status === filter;
    const matchSearch =
      !search ||
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.bankDetails.accountNumber.includes(search);
    return matchFilter && matchSearch;
  });

  function toggleReveal(id: string) {
    setRevealedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApprove(
    id: string,
    req: {
      userName: string;
      bankDetails: { accountNumber: string; ifscCode: string };
      amount: number;
    },
  ) {
    try {
      await approveMutation.mutateAsync(id);
      notifyWhatsApp(
        `WITHDRAWAL APPROVED\nUser: ${req.userName}\nAmount: ₹${req.amount}\nAccount: ${req.bankDetails.accountNumber}\nIFSC: ${req.bankDetails.ifscCode}\nPlease process the bank transfer.`,
      );
      toast.success("Withdrawal approved and processed");
    } catch {
      toast.error("Failed to approve");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectMutation.mutateAsync(id);
      notifyWhatsApp(`WITHDRAWAL REJECTED\nRequest ID: ${id}`);
      toast.success("Withdrawal rejected, balance refunded");
    } catch {
      toast.error("Failed to reject");
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by name or account number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary/30 border-border/50 text-sm h-9"
        />
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className={`h-9 text-xs px-3 ${filter === f ? "bg-primary text-primary-foreground" : "border-border/50"}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({withdrawals.filter((w) => w.status === f).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-chart-2 mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">
              No withdrawal requests found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const isRevealed = revealedAccounts.has(req.id);
            const maskedAccount = req.bankDetails.accountNumber.replace(
              /.(?=.{4})/g,
              "*",
            );
            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`border-border/50 ${req.status === "Pending" ? "border-warning/20" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-foreground">
                            {req.userName}
                          </p>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold text-primary">
                              {formatINR(req.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Account</p>
                            <div className="flex items-center gap-1">
                              <p className="font-mono">
                                {isRevealed
                                  ? req.bankDetails.accountNumber
                                  : maskedAccount}
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleReveal(req.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">IFSC</p>
                            <p className="font-mono">
                              {req.bankDetails.ifscCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Holder</p>
                            <p className="truncate">
                              {req.bankDetails.holderName}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.requestedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          · {timeAgo(req.requestedAt)}
                        </p>
                      </div>
                      {req.status === "Pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-chart-2/30 border h-8 text-xs gap-1.5"
                            onClick={() => handleApprove(req.id, req)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10 h-8 text-xs gap-1.5"
                            onClick={() => handleReject(req.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Tab: Users ───────────────────────────────────────────────

function UsersTab() {
  const { data: users = [], isLoading } = useAllUsersData();
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");

  const filtered = users.filter((u) => {
    if (!search) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase())
    );
  });

  function handleAdjustBalance(userId: string) {
    const amount = Number.parseFloat(adjustAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const key = `investpro_user_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      toast.error("User data not found");
      return;
    }
    const data = JSON.parse(raw) as {
      wallet: { balance: number };
      transactions: Array<{
        id: string;
        type: string;
        amount: number;
        description: string;
        timestamp: number;
        status: string;
      }>;
    };
    const delta = adjustType === "add" ? amount : -amount;
    data.wallet.balance = Math.max(0, data.wallet.balance + delta);
    data.transactions.unshift({
      id: `admin_adj_${Date.now()}`,
      type: adjustType === "add" ? "Deposit" : "Withdrawal",
      amount,
      description: `Admin balance ${adjustType === "add" ? "credit" : "deduction"}: ₹${amount}`,
      timestamp: Date.now(),
      status: "Success",
    });
    localStorage.setItem(key, JSON.stringify(data));
    toast.success(
      `Balance ${adjustType === "add" ? "added" : "deducted"}: ${formatINR(amount)}`,
    );
    setAdjustingUser(null);
    setAdjustAmount("");
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4">
        <Input
          placeholder="Search by name or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary/30 border-border/50 text-sm h-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    User
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Balance
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    Investments
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    ROI Earned
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                    Bank
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <>
                    <motion.tr
                      key={`${user.userId}-row`}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() =>
                        setExpandedUser(
                          expandedUser === user.userId ? null : user.userId,
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                          {user.userId.slice(0, 16)}…
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-primary">
                          {formatINR(user.data.wallet.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-sm font-medium text-foreground">
                          {
                            user.data.investments.filter(
                              (i) => i.status === "Active",
                            ).length
                          }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-chart-2">
                          {formatINR(user.data.wallet.totalROIEarned)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {user.data.bankProfile.isLinked ? (
                          <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs">
                            Linked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedUser === user.userId ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </motion.tr>

                    <AnimatePresence key={`${user.userId}-detail`}>
                      {expandedUser === user.userId && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 pb-4 bg-secondary/10 border-b border-border/30"
                          >
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Wallet Stats */}
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Wallet
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {[
                                      {
                                        label: "Balance",
                                        value: formatINR(
                                          user.data.wallet.balance,
                                        ),
                                        color: "text-primary",
                                      },
                                      {
                                        label: "Deposited",
                                        value: formatINR(
                                          user.data.wallet.totalDeposited,
                                        ),
                                        color: "text-foreground",
                                      },
                                      {
                                        label: "Withdrawn",
                                        value: formatINR(
                                          user.data.wallet.totalWithdrawn,
                                        ),
                                        color: "text-chart-5",
                                      },
                                      {
                                        label: "ROI Earned",
                                        value: formatINR(
                                          user.data.wallet.totalROIEarned,
                                        ),
                                        color: "text-chart-2",
                                      },
                                    ].map((item) => (
                                      <div
                                        key={item.label}
                                        className="bg-card rounded-lg p-2.5 border border-border/40"
                                      >
                                        <p className="text-muted-foreground">
                                          {item.label}
                                        </p>
                                        <p
                                          className={`font-semibold ${item.color}`}
                                        >
                                          {item.value}
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  {adjustingUser === user.userId ? (
                                    <div className="bg-card rounded-lg p-3 border border-border/40 space-y-2">
                                      <p className="text-xs font-semibold text-foreground">
                                        Adjust Balance
                                      </p>
                                      <div className="flex gap-1.5">
                                        <Button
                                          size="sm"
                                          className={`h-7 text-xs flex-1 ${adjustType === "add" ? "bg-chart-2/20 text-chart-2 border-chart-2/30 border" : "bg-secondary/50 text-muted-foreground"}`}
                                          variant="ghost"
                                          onClick={() => setAdjustType("add")}
                                        >
                                          + Add
                                        </Button>
                                        <Button
                                          size="sm"
                                          className={`h-7 text-xs flex-1 ${adjustType === "deduct" ? "bg-destructive/20 text-destructive border-destructive/30 border" : "bg-secondary/50 text-muted-foreground"}`}
                                          variant="ghost"
                                          onClick={() =>
                                            setAdjustType("deduct")
                                          }
                                        >
                                          − Deduct
                                        </Button>
                                      </div>
                                      <div className="flex gap-1.5">
                                        <Input
                                          type="number"
                                          placeholder="Amount"
                                          value={adjustAmount}
                                          onChange={(e) =>
                                            setAdjustAmount(e.target.value)
                                          }
                                          className="h-7 text-xs bg-secondary/30"
                                        />
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() =>
                                            handleAdjustBalance(user.userId)
                                          }
                                        >
                                          <Save className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs"
                                          onClick={() => {
                                            setAdjustingUser(null);
                                            setAdjustAmount("");
                                          }}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full h-7 text-xs border-border/50 gap-1.5"
                                      onClick={() => {
                                        setAdjustingUser(user.userId);
                                        setAdjustAmount("");
                                      }}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Adjust Balance
                                    </Button>
                                  )}
                                </div>

                                {/* Investments */}
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Investments ({user.data.investments.length})
                                  </p>
                                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                                    {user.data.investments.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        No investments yet
                                      </p>
                                    ) : (
                                      user.data.investments.map((inv) => (
                                        <div
                                          key={inv.id}
                                          className="bg-card rounded-lg p-2.5 border border-border/40 text-xs"
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold">
                                              {inv.planName} Plan
                                            </span>
                                            <Badge
                                              className={`text-[10px] ${inv.status === "Active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-secondary text-muted-foreground"}`}
                                            >
                                              {inv.status}
                                            </Badge>
                                          </div>
                                          <p className="text-muted-foreground">
                                            {formatINR(inv.amountInvested)} ·{" "}
                                            {formatINR(inv.dailyReturn)}/day ·
                                            Day {inv.daysCompleted}/30
                                          </p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* Bank + Transactions */}
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Bank Profile
                                  </p>
                                  {user.data.bankProfile.isLinked ? (
                                    <div className="bg-card rounded-lg p-2.5 border border-border/40 text-xs space-y-1">
                                      <p>
                                        <span className="text-muted-foreground">
                                          Holder:{" "}
                                        </span>
                                        {user.data.bankProfile.holderName}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">
                                          Account:{" "}
                                        </span>
                                        <span className="font-mono">
                                          {user.data.bankProfile.accountNumber}
                                        </span>
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">
                                          IFSC:{" "}
                                        </span>
                                        <span className="font-mono">
                                          {user.data.bankProfile.ifscCode}
                                        </span>
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      No bank account linked
                                    </p>
                                  )}

                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
                                    Recent Transactions
                                  </p>
                                  <div className="space-y-1 max-h-28 overflow-y-auto">
                                    {user.data.transactions
                                      .slice(0, 5)
                                      .map((tx) => (
                                        <div
                                          key={tx.id}
                                          className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-0"
                                        >
                                          <span className="text-muted-foreground truncate max-w-[130px]">
                                            {tx.description}
                                          </span>
                                          <span
                                            className={`font-semibold flex-shrink-0 ${tx.type === "ROI" || tx.type === "Deposit" ? "text-chart-2" : "text-destructive"}`}
                                          >
                                            {tx.type === "Withdrawal"
                                              ? "−"
                                              : "+"}
                                            {formatINR(tx.amount)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">No users found</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

// ── Tab: Plans ───────────────────────────────────────────────

function PlansTab() {
  const { data: overrides = [] } = usePlanOverrides();
  const savePlanOverrideMutation = useSavePlanOverride();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    amountInvested: "",
    dailyReturn: "",
    termDays: "",
  });

  const plans = Object.values(INVESTMENT_PLANS);

  function getOverrideForPlan(planId: string): PlanOverride | undefined {
    return overrides.find((o) => o.planId === planId);
  }

  function startEdit(plan: (typeof plans)[0]) {
    const override = getOverrideForPlan(plan.id);
    setEditingPlan(plan.id);
    setEditValues({
      amountInvested: (
        override?.amountInvested ?? plan.amountInvested
      ).toString(),
      dailyReturn: (override?.dailyReturn ?? plan.dailyReturn).toString(),
      termDays: (override?.termDays ?? plan.termDays).toString(),
    });
  }

  async function handleSave(planId: "mini" | "starter" | "silver" | "gold") {
    const amountInvested = Number.parseFloat(editValues.amountInvested);
    const dailyReturn = Number.parseFloat(editValues.dailyReturn);
    const termDays = Number.parseInt(editValues.termDays, 10);
    if (
      Number.isNaN(amountInvested) ||
      Number.isNaN(dailyReturn) ||
      Number.isNaN(termDays)
    ) {
      toast.error("Please enter valid numbers");
      return;
    }
    await savePlanOverrideMutation.mutateAsync({
      planId,
      amountInvested,
      dailyReturn,
      termDays,
    });
    toast.success("Plan settings saved");
    setEditingPlan(null);
  }

  const planColors: Record<string, string> = {
    mini: "text-chart-2 bg-chart-2/10 border-chart-2/20",
    starter: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    silver: "text-primary bg-primary/10 border-primary/20",
    gold: "text-warning bg-warning/10 border-warning/20",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const override = getOverrideForPlan(plan.id);
          const isEditing = editingPlan === plan.id;
          const current = override ?? plan;
          const colorClass =
            planColors[plan.id] ??
            "text-primary bg-primary/10 border-primary/20";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${colorClass} text-xs font-semibold`}>
                        {plan.name}
                      </Badge>
                      {override && (
                        <Badge
                          variant="outline"
                          className="text-xs border-border/50 text-muted-foreground"
                        >
                          Custom
                        </Badge>
                      )}
                    </div>
                    {!isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-border/50 gap-1.5"
                        onClick={() => startEdit(plan)}
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Investment (₹)
                          </Label>
                          <Input
                            type="number"
                            value={editValues.amountInvested}
                            onChange={(e) =>
                              setEditValues((p) => ({
                                ...p,
                                amountInvested: e.target.value,
                              }))
                            }
                            className="h-8 text-xs bg-secondary/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Daily Return (₹)
                          </Label>
                          <Input
                            type="number"
                            value={editValues.dailyReturn}
                            onChange={(e) =>
                              setEditValues((p) => ({
                                ...p,
                                dailyReturn: e.target.value,
                              }))
                            }
                            className="h-8 text-xs bg-secondary/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Term (days)
                          </Label>
                          <Input
                            type="number"
                            value={editValues.termDays}
                            onChange={(e) =>
                              setEditValues((p) => ({
                                ...p,
                                termDays: e.target.value,
                              }))
                            }
                            className="h-8 text-xs bg-secondary/30"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-primary text-primary-foreground gap-1.5"
                          onClick={() =>
                            handleSave(
                              plan.id as "mini" | "starter" | "silver" | "gold",
                            )
                          }
                          disabled={savePlanOverrideMutation.isPending}
                        >
                          {savePlanOverrideMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-border/50"
                          onClick={() => setEditingPlan(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {[
                        {
                          label: "Investment",
                          value: formatINR(current.amountInvested),
                        },
                        {
                          label: "Daily ROI",
                          value: formatINR(current.dailyReturn),
                        },
                        {
                          label: "Term",
                          value: `${override?.termDays ?? plan.termDays} days`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-secondary/30 rounded-lg p-2.5"
                        >
                          <p className="text-muted-foreground mb-0.5">
                            {item.label}
                          </p>
                          <p className="font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {plan.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Tab: Settings ────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  maxWithdrawal: 11000,
  adminWhatsApp: "9813983483",
  supportEmail: "warisbhaimewati@gmail.com",
  supportWhatsApp: "9813983483",
  upiId: "9813983483-2.wallet@phonepe",
  bankAccount: "7871001700092453",
  bankIfsc: "PUNB0787100",
  bankName: "Punjab National Bank",
};

function SettingsTab() {
  const { data: settings } = usePlatformSettings();
  const saveMutation = useSavePlatformSettings();
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function handleSave() {
    await saveMutation.mutateAsync(form);
    toast.success("Settings saved successfully");
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS });
    toast.info("Reset to defaults — click Save to apply");
  }

  const fields: Array<{
    key: keyof typeof DEFAULT_SETTINGS;
    label: string;
    type: string;
    placeholder: string;
  }> = [
    {
      key: "maxWithdrawal",
      label: "Max Withdrawal Limit (₹)",
      type: "number",
      placeholder: "11000",
    },
    {
      key: "adminWhatsApp",
      label: "Admin WhatsApp Number",
      type: "text",
      placeholder: "9813983483",
    },
    {
      key: "supportEmail",
      label: "Support Email",
      type: "email",
      placeholder: "warisbhaimewati@gmail.com",
    },
    {
      key: "supportWhatsApp",
      label: "Support WhatsApp",
      type: "text",
      placeholder: "9813983483",
    },
    {
      key: "upiId",
      label: "UPI ID",
      type: "text",
      placeholder: "9813983483-2.wallet@phonepe",
    },
    {
      key: "bankAccount",
      label: "Bank Account Number",
      type: "text",
      placeholder: "7871001700092453",
    },
    {
      key: "bankIfsc",
      label: "Bank IFSC Code",
      type: "text",
      placeholder: "PUNB0787100",
    },
    {
      key: "bankName",
      label: "Bank Name",
      type: "text",
      placeholder: "Punjab National Bank",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border-border/50">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Platform Configuration
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure payment details, withdrawal limits, and support contacts.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">
                  {label}
                </Label>
                <Input
                  type={type}
                  value={
                    type === "number"
                      ? String(form[key])
                      : (form[key] as string)
                  }
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [key]:
                        type === "number"
                          ? Number.parseFloat(e.target.value) || 0
                          : e.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="bg-secondary/30 border-border/50 h-9 text-sm"
                />
              </div>
            ))}
          </div>

          <Separator className="my-5 border-border/40" />

          <div className="flex gap-3">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Settings
            </Button>
            <Button
              variant="outline"
              className="border-border/50 gap-2"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Notices ─────────────────────────────────────────────

function NoticesTab() {
  const { data: notices = [] } = useBroadcastNotices();
  const addNotice = useAddNotice();
  const deleteNotice = useDeleteNotice();
  const [message, setMessage] = useState("");
  const [noticeType, setNoticeType] = useState<"info" | "warning" | "success">(
    "info",
  );

  async function handlePost() {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    await addNotice.mutateAsync({ message: message.trim(), type: noticeType });
    toast.success("Notice posted to all dashboards");
    setMessage("");
  }

  async function handleDelete(id: string) {
    await deleteNotice.mutateAsync(id);
    toast.success("Notice removed");
  }

  const typeConfig = {
    info: {
      label: "Info",
      badge: "bg-chart-3/15 text-chart-3 border-chart-3/30",
      card: "border-chart-3/20",
    },
    warning: {
      label: "Warning",
      badge: "bg-warning/15 text-warning border-warning/30",
      card: "border-warning/20",
    },
    success: {
      label: "Success",
      badge: "bg-chart-2/15 text-chart-2 border-chart-2/30",
      card: "border-chart-2/20",
    },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border-border/50 mb-5">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Post New Notice
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Notices appear as banners on all user dashboards.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <Textarea
            placeholder="Enter notice message for users..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-secondary/30 border-border/50 text-sm min-h-[80px] resize-none"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {(["info", "warning", "success"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNoticeType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    noticeType === t
                      ? typeConfig[t].badge
                      : "border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {typeConfig[t].label}
                </button>
              ))}
            </div>
            <Button
              className="bg-primary text-primary-foreground gap-2 ml-auto"
              onClick={handlePost}
              disabled={addNotice.isPending}
            >
              {addNotice.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Post Notice
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm">No active notices</p>
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => (
            <motion.div
              key={notice.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border ${typeConfig[notice.type].card}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      className={`${typeConfig[notice.type].badge} text-xs shrink-0`}
                    >
                      {typeConfig[notice.type].label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {notice.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(notice.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Main Admin Component ─────────────────────────────────────

export function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: withdrawals = [] } = useGlobalWithdrawals();
  const { data: deposits = [] } = useGlobalDeposits();

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "Pending");
  const pendingDeposits = deposits.filter((d) => d.status === "Pending");

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="p-2.5 emerald-gradient rounded-xl shadow-lg">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Super Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete platform control — users, transactions, plans &amp;
              settings
            </p>
          </div>
          <Badge className="emerald-gradient text-primary-foreground border-0 ml-auto text-xs px-2.5">
            SUPER ADMIN
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-1 mb-6">
          <TabsList className="bg-secondary/50 border border-border/40 h-10 flex gap-0.5 w-max min-w-full">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="deposits"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deposits</span>
              {pendingDeposits.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                  {pendingDeposits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="withdrawals"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Withdrawals</span>
              {pendingWithdrawals.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                  {pendingWithdrawals.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plans</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger
              value="notices"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 h-8"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notices</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab onTabChange={setActiveTab} />
        </TabsContent>
        <TabsContent value="deposits">
          <DepositsTab />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="plans">
          <PlansTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
        <TabsContent value="notices">
          <NoticesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
