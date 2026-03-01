import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useBroadcastNotices,
  useClaimROI,
  useUserData,
  useUserProfile,
} from "@/hooks/useQueries";
import {
  canClaimROI,
  formatINR,
  timeUntilNextClaim,
} from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export function Dashboard() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();
  const { data: profile } = useUserProfile();
  const { data: userData, isLoading } = useUserData(userId);
  const claimMutation = useClaimROI(userId);
  const { data: notices = [] } = useBroadcastNotices();
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(
    new Set(),
  );

  const visibleNotices = notices.filter((n) => !dismissedNotices.has(n.id));

  function dismissNotice(id: string) {
    setDismissedNotices((prev) => new Set([...prev, id]));
  }

  const noticeStyles = {
    info: {
      bg: "bg-chart-3/10 border-chart-3/30",
      text: "text-chart-3",
      icon: Info,
    },
    warning: {
      bg: "bg-warning/10 border-warning/30",
      text: "text-warning",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-chart-2/10 border-chart-2/30",
      text: "text-chart-2",
      icon: CheckCircle2,
    },
  };

  const wallet = userData?.wallet;
  const activeInvestments =
    userData?.investments.filter((i) => i.status === "Active") ?? [];
  const totalActiveCount = activeInvestments.length;

  async function handleClaim(investmentId: string) {
    try {
      const result = await claimMutation.mutateAsync(investmentId);
      toast.success(result.message ?? "ROI claimed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    }
  }

  const statCards = [
    {
      label: "Total Balance",
      value: wallet ? formatINR(wallet.balance) : "₹0",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
      change: wallet ? `+${formatINR(wallet.totalROIEarned)} earned` : null,
    },
    {
      label: "Active Investments",
      value: totalActiveCount.toString(),
      icon: TrendingUp,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
      change: `${userData?.investments.filter((i) => i.status === "Expired").length ?? 0} expired`,
    },
    {
      label: "Total Withdrawn",
      value: wallet ? formatINR(wallet.totalWithdrawn) : "₹0",
      icon: ArrowUpCircle,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
      change: wallet ? `${formatINR(wallet.totalDeposited)} deposited` : null,
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Broadcast Notices */}
      <AnimatePresence>
        {visibleNotices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 space-y-2"
          >
            {visibleNotices.map((notice) => {
              const style = noticeStyles[notice.type];
              const Icon = style.icon;
              return (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${style.bg}`}
                >
                  <Icon
                    className={`w-4 h-4 ${style.text} mt-0.5 flex-shrink-0`}
                  />
                  <p className={`text-sm flex-1 ${style.text}`}>
                    {notice.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => dismissNotice(notice.id)}
                    className={`${style.text} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}
                    aria-label="Dismiss notice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back,{" "}
          <span className="gold-text">
            {profile?.name?.split(" ")[0] ?? "Investor"}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your investments are growing. Here's your financial overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp}>
              <Card className="relative overflow-hidden border-border/50 stat-card-shine bg-card shadow-card hover:border-primary/30 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28 mb-1" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground/70 mt-1.5">
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="font-display font-semibold text-lg mb-4 text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/deposit">
            <Card className="border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                  <ArrowDownCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Deposit</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/withdraw">
            <Card className="border-border/50 hover:border-chart-5/40 hover:bg-chart-5/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-chart-5/10 rounded-lg w-fit mx-auto mb-2 group-hover:bg-chart-5/20 transition-colors">
                  <ArrowUpCircle className="w-5 h-5 text-chart-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Withdraw</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/plans">
            <Card className="border-border/50 hover:border-chart-2/40 hover:bg-chart-2/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-chart-2/10 rounded-lg w-fit mx-auto mb-2 group-hover:bg-chart-2/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-chart-2" />
                </div>
                <p className="text-sm font-medium text-foreground">Invest</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Active Investments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-foreground">
            Active Investments
          </h2>
          <Link to="/plans">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary gap-1 text-xs"
            >
              View Plans
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeInvestments.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-8 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">
                No active investments
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Start earning daily returns by investing in one of our plans.
              </p>
              <Link to="/plans">
                <Button
                  size="sm"
                  className="gold-gradient text-primary-foreground border-0 font-semibold"
                >
                  Browse Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeInvestments.map((inv) => {
              const progress = (inv.daysCompleted / 30) * 100;
              const canClaim = canClaimROI(inv);
              const nextClaim = timeUntilNextClaim(inv);

              return (
                <motion.div
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-border/50 hover:border-primary/30 transition-colors duration-200 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-base text-foreground">
                              {inv.planName} Plan
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs"
                            >
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatINR(inv.amountInvested)} invested •{" "}
                            {formatINR(inv.dailyReturn)}/day
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-chart-2">
                            {formatINR(inv.totalEarned)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            earned
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Day {inv.daysCompleted} of 30</span>
                          <span>{Math.round(progress)}% complete</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-1.5 bg-secondary"
                        />
                      </div>

                      {/* Claim button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {canClaim ? "Ready to claim!" : nextClaim}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!canClaim || claimMutation.isPending}
                          onClick={() => handleClaim(inv.id)}
                          className={
                            canClaim
                              ? "gold-gradient text-primary-foreground border-0 font-semibold text-xs h-8"
                              : "text-xs h-8"
                          }
                        >
                          {claimMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : canClaim ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {canClaim
                            ? `Claim ${formatINR(inv.dailyReturn)}`
                            : "Claim Tomorrow"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
