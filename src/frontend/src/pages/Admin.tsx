import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAllUsersData,
  useApproveDeposit,
  useApproveWithdrawal,
  useGlobalDeposits,
  useGlobalWithdrawals,
  useRejectDeposit,
  useRejectWithdrawal,
} from "@/hooks/useQueries";
import { formatINR } from "@/store/investmentStore";
import {
  ArrowDownCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function Admin() {
  const { data: withdrawals = [], isLoading: withdrawalsLoading } =
    useGlobalWithdrawals();
  const { data: deposits = [], isLoading: depositsLoading } =
    useGlobalDeposits();
  const { data: users = [], isLoading: usersLoading } = useAllUsersData();
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();
  const approveDepositMutation = useApproveDeposit();
  const rejectDepositMutation = useRejectDeposit();

  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(
    null,
  );

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "Pending");
  const pendingDeposits = deposits.filter((d) => d.status === "Pending");

  async function handleApprove(
    id: string,
    _req: {
      userName: string;
      bankDetails: { accountNumber: string; ifscCode: string };
      amount: number;
    },
  ) {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Withdrawal approved and processed");
    } catch {
      toast.error("Failed to approve");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Withdrawal rejected, balance refunded");
    } catch {
      toast.error("Failed to reject");
    }
  }

  async function handleApproveDeposit(
    id: string,
    _userId: string,
    _amount: number,
    _utr: string,
  ) {
    try {
      await approveDepositMutation.mutateAsync(id);
      toast.success("Deposit approved — wallet credited");
    } catch {
      toast.error("Failed to approve deposit");
    }
  }

  async function handleRejectDeposit(id: string) {
    try {
      await rejectDepositMutation.mutateAsync(id);
      toast.success("Deposit request rejected");
    } catch {
      toast.error("Failed to reject deposit");
    }
  }

  // Stats
  const totalUsers = users.length;
  const totalInvested = users.reduce(
    (sum, u) =>
      sum + u.data.investments.reduce((s, inv) => s + inv.amountInvested, 0),
    0,
  );
  const totalROIPaid = users.reduce(
    (sum, u) => sum + u.data.wallet.totalROIEarned,
    0,
  );
  const totalWithdrawn = users.reduce(
    (sum, u) => sum + u.data.wallet.totalWithdrawn,
    0,
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 gold-gradient rounded-lg">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage withdrawals, users and platform stats
            </p>
          </div>
          <Badge className="gold-gradient text-primary-foreground border-0 ml-auto">
            ADMIN
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="deposits">
        <TabsList className="bg-secondary/50 border border-border/40 mb-6 h-10 flex flex-wrap gap-1">
          <TabsTrigger
            value="deposits"
            className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
          >
            Deposits
            {pendingDeposits.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {pendingDeposits.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
          >
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {pendingWithdrawals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-foreground">
                Deposit Requests ({deposits.length})
              </h2>
            </div>

            {depositsLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : deposits.length === 0 ? (
              <Card className="border-border/50 border-dashed">
                <CardContent className="p-12 text-center">
                  <ArrowDownCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">
                    No deposit requests yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {deposits.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={`border-border/50 ${req.status === "Pending" ? "border-warning/20" : ""}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-display font-semibold text-foreground">
                                {req.userName}
                              </p>
                              <Badge
                                className={
                                  req.status === "Pending"
                                    ? "bg-warning/10 text-warning border-warning/20 text-xs"
                                    : req.status === "Approved"
                                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs"
                                      : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                                }
                              >
                                {req.status === "Pending" ? (
                                  <Clock className="w-3 h-3 mr-1" />
                                ) : req.status === "Approved" ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {req.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-semibold text-primary">
                                  {formatINR(req.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  UTR / Ref
                                </p>
                                <p className="font-mono text-foreground">
                                  {req.utr}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Requested
                                </p>
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
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              User ID: {req.userId}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {/* Screenshot thumbnail */}
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

            {/* Screenshot lightbox */}
            {expandedScreenshot && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="relative max-w-lg w-full">
                  <img
                    src={expandedScreenshot}
                    alt="Payment proof"
                    className="w-full rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedScreenshot(null)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-foreground">
                Pending Withdrawals ({pendingWithdrawals.length})
              </h2>
            </div>

            {withdrawalsLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : withdrawals.length === 0 ? (
              <Card className="border-border/50 border-dashed">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-8 h-8 text-chart-2 mx-auto mb-3 opacity-60" />
                  <p className="text-muted-foreground">
                    No withdrawal requests
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={`border-border/50 ${req.status === "Pending" ? "border-warning/20" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-display font-semibold text-foreground">
                                {req.userName}
                              </p>
                              <Badge
                                className={
                                  req.status === "Pending"
                                    ? "bg-warning/10 text-warning border-warning/20 text-xs"
                                    : req.status === "Approved"
                                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs"
                                      : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                                }
                              >
                                {req.status === "Pending" ? (
                                  <Clock className="w-3 h-3 mr-1" />
                                ) : req.status === "Approved" ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {req.status}
                              </Badge>
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
                                <p className="font-mono">
                                  {req.bankDetails.accountNumber.replace(
                                    /.(?=.{4})/g,
                                    "*",
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">IFSC</p>
                                <p className="font-mono">
                                  {req.bankDetails.ifscCode}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Requested
                                </p>
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
                            </div>
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
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">
              All Users ({users.length})
            </h2>

            {usersLoading ? (
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
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                          Investments
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                          ROI Earned
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                          Bank
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <motion.tr
                          key={user.userId}
                          className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                              {user.userId}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-primary">
                              {formatINR(user.data.wallet.balance)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-right">
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
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
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
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[
              {
                label: "Total Users",
                value: totalUsers.toString(),
                icon: Users,
                color: "text-chart-3",
              },
              {
                label: "Total Invested",
                value: formatINR(totalInvested),
                icon: TrendingUp,
                color: "text-primary",
              },
              {
                label: "Total ROI Paid",
                value: formatINR(totalROIPaid),
                icon: DollarSign,
                color: "text-chart-2",
              },
              {
                label: "Total Withdrawals",
                value: formatINR(totalWithdrawn),
                icon: BarChart3,
                color: "text-chart-5",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="p-5">
                      <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
                      <p className="font-display font-bold text-xl text-foreground">
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
          </motion.div>

          {/* Withdrawal Stats */}
          <div className="mt-6">
            <h3 className="font-display font-semibold text-base mb-4 text-foreground">
              Withdrawal Status Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Pending",
                  count: withdrawals.filter((w) => w.status === "Pending")
                    .length,
                  color: "text-warning",
                  bg: "bg-warning/10",
                },
                {
                  label: "Approved",
                  count: withdrawals.filter((w) => w.status === "Approved")
                    .length,
                  color: "text-chart-2",
                  bg: "bg-chart-2/10",
                },
                {
                  label: "Rejected",
                  count: withdrawals.filter((w) => w.status === "Rejected")
                    .length,
                  color: "text-destructive",
                  bg: "bg-destructive/10",
                },
              ].map((s) => (
                <Card key={s.label} className="border-border/50">
                  <CardContent className={`p-4 ${s.bg}`}>
                    <p className={`font-display font-bold text-2xl ${s.color}`}>
                      {s.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
