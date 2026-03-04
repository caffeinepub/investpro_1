import {
  EnterReferralCode,
  shouldShowReferralCard,
} from "@/components/EnterReferralCode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBroadcastNotices,
  useClaimROI,
  useUserData,
  useUserProfile,
} from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import {
  canClaimROI,
  formatINR,
  getRoyalPassStatus,
  getUserTier,
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
  Crown,
  Info,
  Loader2,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ── Tier background animations ────────────────────────────────

function ClassicTierBg() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${5 + ((i * 8) % 90)}%`,
        size: 3 + (i % 3),
        delay: i * 0.4,
        duration: 3 + (i % 3) * 0.8,
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-8px",
            width: p.size,
            height: p.size,
            background:
              "linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.85 0.2 78))",
            opacity: 0.55,
          }}
          animate={{
            y: [-0, -90],
            x: [0, (p.id % 2 === 0 ? 1 : -1) * 12],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Subtle gold tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, oklch(0.78 0.12 75 / 0.07) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function NormalBusinessTierBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Breathing green glow rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            left: `${20 + i * 25}%`,
            top: `${10 + i * 15}%`,
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            borderColor: `oklch(0.72 0.2 160 / ${0.12 - i * 0.03})`,
          }}
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: 2.5 + i * 0.5,
            delay: i * 0.7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Green ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 35% at 30% 50%, oklch(0.72 0.2 160 / 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function VIPTierBg() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${10 + i * 12}%`,
        top: `${15 + ((i * 17) % 70)}%`,
        delay: i * 0.3,
        size: 4 + (i % 3),
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-y-0 w-[50%]"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, oklch(0.65 0.28 310 / 0.04) 40%, oklch(0.65 0.28 310 / 0.10) 50%, oklch(0.65 0.28 310 / 0.04) 60%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "250%"] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatDelay: 1,
        }}
      />
      {/* Star sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: s.left, top: s.top }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.8,
            delay: s.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2 + s.id * 0.4,
          }}
        >
          <Star
            className="fill-current"
            style={{
              width: s.size,
              height: s.size,
              color:
                s.id % 2 === 0 ? "oklch(0.78 0.16 75)" : "oklch(0.65 0.28 310)",
            }}
          />
        </motion.div>
      ))}
      {/* Purple-pink gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 70% 20%, oklch(0.65 0.25 310 / 0.1) 0%, oklch(0.65 0.24 280 / 0.06) 50%, transparent 80%)",
        }}
      />
    </div>
  );
}

function NeutralTierBg() {
  const dots = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: `${15 + i * 15}%`,
        top: `${20 + ((i * 22) % 60)}%`,
        delay: i * 0.8,
      })),
    [],
  );
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/20"
          style={{ left: d.left, top: d.top }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 3,
            delay: d.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const TIER_BADGE_CONFIG = {
  Classic: {
    label: "Classic Member",
    icon: Star,
    className: "gold-gradient text-[#1a1a0a] border-0",
  },
  NormalBusiness: {
    label: "Business Member",
    icon: TrendingUp,
    className:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  VIP: {
    label: "VIP Member",
    icon: Crown,
    className: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  },
} as const;

export function Dashboard() {
  const userId = useUserId();
  const { data: profile } = useUserProfile();
  const { data: userData, isLoading } = useUserData(userId);
  const claimMutation = useClaimROI(userId);
  const { data: notices = [] } = useBroadcastNotices();
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(
    new Set(),
  );
  const [showReferralCard, setShowReferralCard] = useState(() =>
    userId ? shouldShowReferralCard(userId) : false,
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

  // Determine current tier for background animations and badge
  const currentTier = getUserTier(userData?.investments ?? []);

  // Royal Pass status
  const hasRoyalPass = userId ? getRoyalPassStatus(userId) : false;

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
    <div
      className="p-3 lg:p-5 max-w-7xl mx-auto relative"
      style={{
        boxShadow: hasRoyalPass
          ? "0 0 40px oklch(0.78 0.16 75 / 0.15)"
          : undefined,
      }}
    >
      {/* Tier-specific background animation */}
      {currentTier === "Classic" && <ClassicTierBg />}
      {currentTier === "NormalBusiness" && <NormalBusinessTierBg />}
      {currentTier === "VIP" && <VIPTierBg />}
      {currentTier === null && <NeutralTierBg />}

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

      {/* Referral Code Entry Card */}
      <AnimatePresence>
        {showReferralCard && userId && (
          <EnterReferralCode
            userId={userId}
            onDismiss={() => setShowReferralCard(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="mb-5 relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="gold-text">
              {profile?.name?.split(" ")[0] ?? "Investor"}
            </span>
          </h1>
          {/* Tier badge with entrance animation */}
          <AnimatePresence>
            {currentTier && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3,
                }}
              >
                {(() => {
                  const cfg = TIER_BADGE_CONFIG[currentTier];
                  const TierIcon = cfg.icon;
                  return (
                    <Badge
                      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 ${cfg.className}`}
                    >
                      <TierIcon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Royal Pass badge */}
          <AnimatePresence>
            {hasRoyalPass && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.45,
                }}
              >
                <Badge
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 border-0"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.78 0.16 75), oklch(0.9 0.22 82))",
                    color: "oklch(0.08 0.03 75)",
                  }}
                >
                  <Crown className="w-3 h-3" />
                  Royal Pass
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Your investments are growing. Here's your financial overview.
        </p>
      </motion.div>

      {/* Royal Pass Banner */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        {hasRoyalPass ? (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.6), oklch(0.08 0.02 285 / 0.9))",
              border: "1px solid oklch(0.78 0.16 75 / 0.35)",
              boxShadow: "0 0 20px oklch(0.78 0.16 75 / 0.08)",
            }}
          >
            <div
              className="p-2 rounded-xl flex-shrink-0"
              style={{
                background: "oklch(0.78 0.16 75 / 0.15)",
                border: "1px solid oklch(0.78 0.16 75 / 0.3)",
              }}
            >
              <Crown
                className="w-5 h-5"
                style={{ color: "oklch(0.85 0.2 78)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.85 0.2 78)" }}
              >
                Royal Pass Active
              </p>
              <p className="text-xs text-muted-foreground">
                Fast withdraw • VIP support • Premium features unlocked
              </p>
            </div>
            <CheckCircle2
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "oklch(0.72 0.18 155)" }}
            />
          </div>
        ) : (
          <div
            className="rounded-xl p-4 flex items-center gap-3 overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.4), oklch(0.08 0.02 285 / 0.6))",
              border: "1px solid oklch(0.78 0.16 75 / 0.2)",
            }}
          >
            {/* subtle shimmer */}
            <motion.div
              className="absolute inset-y-0 w-[40%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 0%, oklch(0.78 0.16 75 / 0.04) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                repeatDelay: 2.5,
              }}
            />
            <div
              className="p-2 rounded-xl flex-shrink-0"
              style={{
                background: "oklch(0.78 0.16 75 / 0.1)",
                border: "1px solid oklch(0.78 0.16 75 / 0.2)",
              }}
            >
              <Crown
                className="w-5 h-5"
                style={{ color: "oklch(0.78 0.16 75)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.78 0.16 75)" }}
              >
                Royal Pass
              </p>
              <p className="text-xs text-muted-foreground">
                Fast withdraw • VIP support • Exclusive theme – ₹1,999/month
              </p>
            </div>
            <Link to="/royal-pass" data-ocid="dashboard.royal-pass.link">
              <button
                type="button"
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 border-0"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.78 0.16 75), oklch(0.85 0.2 78))",
                  color: "oklch(0.08 0.03 75)",
                }}
              >
                Upgrade
              </button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp}>
              <Card className="relative overflow-hidden border-border/50 stat-card-shine bg-card shadow-card hover:border-primary/30 transition-colors duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-24 mb-1" />
                  ) : (
                    <p className="text-xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                  {stat.change && (
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
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
        className="mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="font-display font-semibold text-base mb-3 text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <Link to="/deposit">
            <Card className="border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-3 text-center">
                <div className="p-1.5 bg-primary/10 rounded-lg w-fit mx-auto mb-1.5 group-hover:bg-primary/20 transition-colors">
                  <ArrowDownCircle className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">Deposit</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/withdraw">
            <Card className="border-border/50 hover:border-chart-5/40 hover:bg-chart-5/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-3 text-center">
                <div className="p-1.5 bg-chart-5/10 rounded-lg w-fit mx-auto mb-1.5 group-hover:bg-chart-5/20 transition-colors">
                  <ArrowUpCircle className="w-4 h-4 text-chart-5" />
                </div>
                <p className="text-xs font-medium text-foreground">Withdraw</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/plans">
            <Card className="border-border/50 hover:border-chart-2/40 hover:bg-chart-2/5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-3 text-center">
                <div className="p-1.5 bg-chart-2/10 rounded-lg w-fit mx-auto mb-1.5 group-hover:bg-chart-2/20 transition-colors">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                </div>
                <p className="text-xs font-medium text-foreground">Invest</p>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-base text-foreground">
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
            <CardContent className="p-5 text-center">
              <div className="p-2.5 bg-primary/10 rounded-full w-fit mx-auto mb-2.5">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1 text-sm">
                No active investments
              </p>
              <p className="text-xs text-muted-foreground mb-3">
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
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-foreground">
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

      {/* Royal Pass Perks (only when active) */}
      {hasRoyalPass && (
        <motion.div
          className="mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Crown
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.85 0.2 78)" }}
            />
            <h2
              className="font-display font-semibold text-base"
              style={{ color: "oklch(0.85 0.2 78)" }}
            >
              Royal Pass Perks
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Priority Support */}
            <a
              href="https://wa.me/919671870287"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="dashboard.royal-pass.button"
            >
              <Card
                className="border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.5), oklch(0.08 0.02 285 / 0.8))",
                  borderColor: "oklch(0.78 0.16 75 / 0.25)",
                }}
              >
                <CardContent className="p-3 text-center">
                  <div
                    className="p-1.5 rounded-lg w-fit mx-auto mb-1.5"
                    style={{
                      background: "oklch(0.78 0.16 75 / 0.12)",
                      border: "1px solid oklch(0.78 0.16 75 / 0.2)",
                    }}
                  >
                    <MessageCircle
                      className="w-4 h-4"
                      style={{ color: "oklch(0.78 0.16 75)" }}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Priority Support
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    VIP WhatsApp line
                  </p>
                </CardContent>
              </Card>
            </a>
            {/* Fast Withdraw */}
            <Link
              to="/withdraw"
              data-ocid="dashboard.royal-pass.secondary_button"
            >
              <Card
                className="border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.5), oklch(0.08 0.02 285 / 0.8))",
                  borderColor: "oklch(0.78 0.16 75 / 0.25)",
                }}
              >
                <CardContent className="p-3 text-center">
                  <div
                    className="p-1.5 rounded-lg w-fit mx-auto mb-1.5"
                    style={{
                      background: "oklch(0.78 0.16 75 / 0.12)",
                      border: "1px solid oklch(0.78 0.16 75 / 0.2)",
                    }}
                  >
                    <Zap
                      className="w-4 h-4"
                      style={{ color: "oklch(0.85 0.2 78)" }}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Fast Withdraw
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    1-hour processing
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
