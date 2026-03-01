import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCreateInvestment, useUserData } from "@/hooks/useQueries";
import {
  INVESTMENT_PLANS,
  type PlanId,
  formatINR,
} from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Crown,
  Diamond,
  Flame,
  Gem,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Sprout,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PlanMeta {
  icon: React.ElementType;
  badge: string | null;
  badgeStyle: string;
  features: string[];
  gradient: string;
  glowClass: string;
  borderColor: string;
  accentColor: string;
  btnGradient: string;
  shimmer: string;
}

const PLAN_META: Record<PlanId, PlanMeta> = {
  mini: {
    icon: Sprout,
    badge: "Starter",
    badgeStyle:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    features: [
      `${formatINR(82)} daily return`,
      "30-day term",
      `${formatINR(2460)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
    ],
    gradient: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #0f3d2e 100%)",
    glowClass: "plan-glow-emerald",
    borderColor: "rgba(52, 211, 153, 0.25)",
    accentColor: "#34d399",
    btnGradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    shimmer: "rgba(52, 211, 153, 0.08)",
  },
  starter: {
    icon: Zap,
    badge: null,
    badgeStyle: "",
    features: [
      `${formatINR(165)} daily return`,
      "30-day term",
      `${formatINR(4950)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
    ],
    gradient: "linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 50%, #0a2a3d 100%)",
    glowClass: "plan-glow-blue",
    borderColor: "rgba(59, 130, 246, 0.25)",
    accentColor: "#60a5fa",
    btnGradient: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
    shimmer: "rgba(59, 130, 246, 0.08)",
  },
  silver: {
    icon: TrendingUp,
    badge: "Popular",
    badgeStyle: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    features: [
      `${formatINR(825)} daily return`,
      "30-day term",
      `${formatINR(24750)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
      "Priority support",
    ],
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%)",
    glowClass: "plan-glow-indigo",
    borderColor: "rgba(129, 140, 248, 0.3)",
    accentColor: "#a5b4fc",
    btnGradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
    shimmer: "rgba(129, 140, 248, 0.08)",
  },
  gold: {
    icon: Crown,
    badge: "Best Returns",
    badgeStyle: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    features: [
      `${formatINR(1650)} daily return`,
      "30-day term",
      `${formatINR(49500)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
    gradient: "linear-gradient(135deg, #1c1200 0%, #3d2400 55%, #1a1800 100%)",
    glowClass: "plan-glow-amber",
    borderColor: "rgba(251, 191, 36, 0.35)",
    accentColor: "#fbbf24",
    btnGradient: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
    shimmer: "rgba(251, 191, 36, 0.1)",
  },
  diamond: {
    icon: Diamond,
    badge: "Premium",
    badgeStyle: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    features: [
      `${formatINR(4125)} daily return`,
      "30-day term",
      `${formatINR(123750)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
      "Priority support",
      "VIP account manager",
    ],
    gradient: "linear-gradient(135deg, #001a1f 0%, #0e3d4d 50%, #012a33 100%)",
    glowClass: "plan-glow-cyan",
    borderColor: "rgba(34, 211, 238, 0.3)",
    accentColor: "#22d3ee",
    btnGradient: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)",
    shimmer: "rgba(34, 211, 238, 0.08)",
  },
  platinum: {
    icon: Shield,
    badge: "Elite",
    badgeStyle: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    features: [
      `${formatINR(8250)} daily return`,
      "30-day term",
      `${formatINR(247500)} total profit`,
      "Daily claim available",
      "Instant withdrawals",
      "Dedicated wealth advisor",
      "Priority processing",
    ],
    gradient: "linear-gradient(135deg, #0d0020 0%, #2e1065 50%, #1a0f3d 100%)",
    glowClass: "plan-glow-violet",
    borderColor: "rgba(167, 139, 250, 0.3)",
    accentColor: "#a78bfa",
    btnGradient: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
    shimmer: "rgba(167, 139, 250, 0.08)",
  },
  elite: {
    icon: Flame,
    badge: "Hot 🔥",
    badgeStyle: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    features: [
      `${formatINR(16500)} daily return`,
      "30-day term",
      `${formatINR(495000)} total profit`,
      "Daily claim available",
      "Instant withdrawals",
      "Private wealth manager",
      "24/7 concierge support",
    ],
    gradient: "linear-gradient(135deg, #1f0010 0%, #500020 50%, #1c0015 100%)",
    glowClass: "plan-glow-rose",
    borderColor: "rgba(251, 113, 133, 0.3)",
    accentColor: "#fb7185",
    btnGradient: "linear-gradient(135deg, #be123c 0%, #f43f5e 100%)",
    shimmer: "rgba(251, 113, 133, 0.08)",
  },
  vip: {
    icon: Trophy,
    badge: "Exclusive",
    badgeStyle: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    features: [
      `${formatINR(41250)} daily return`,
      "30-day term",
      `${formatINR(1237500)} total profit`,
      "Instant withdrawals",
      "Private banker assigned",
      "VIP lounge access",
      "Exclusive investment events",
    ],
    gradient: "linear-gradient(135deg, #1a0800 0%, #431407 55%, #1c0a00 100%)",
    glowClass: "plan-glow-orange",
    borderColor: "rgba(251, 146, 60, 0.3)",
    accentColor: "#fb923c",
    btnGradient: "linear-gradient(135deg, #c2410c 0%, #f97316 100%)",
    shimmer: "rgba(251, 146, 60, 0.08)",
  },
  royal: {
    icon: Sparkles,
    badge: "👑 ROYAL",
    badgeStyle: "royal-badge text-yellow-200 border border-yellow-400/50",
    features: [
      `${formatINR(82500)} daily return`,
      "30-day term",
      `${formatINR(2475000)} total profit`,
      "Instant withdrawals",
      "Personal wealth strategist",
      "Unlimited concierge service",
      "Exclusive private investment club",
      "Zero fee transactions",
    ],
    gradient:
      "linear-gradient(135deg, #110900 0%, #3d2400 30%, #4a1c00 60%, #1c1000 100%)",
    glowClass: "plan-glow-royal",
    borderColor: "rgba(234, 179, 8, 0.5)",
    accentColor: "#eab308",
    btnGradient:
      "linear-gradient(135deg, #92400e 0%, #d97706 40%, #f59e0b 100%)",
    shimmer: "rgba(234, 179, 8, 0.12)",
  },
};

const ALL_PLANS: PlanId[] = [
  "mini",
  "starter",
  "silver",
  "gold",
  "diamond",
  "platinum",
  "elite",
  "vip",
  "royal",
];

export function Plans() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();
  const { data: userData } = useUserData(userId);
  const investMutation = useCreateInvestment(userId);

  const balance = userData?.wallet.balance ?? 0;

  async function handleInvest(planId: PlanId) {
    const plan = INVESTMENT_PLANS[planId];
    if (balance < plan.amountInvested) {
      toast.error(
        `Insufficient balance. You need ${formatINR(plan.amountInvested)} to invest. Please deposit first.`,
      );
      return;
    }
    try {
      await investMutation.mutateAsync(planId);
      toast.success(
        `${plan.name} Plan activated! Start claiming daily returns.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Investment failed");
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.15) 100%)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          <Star className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
            Investment Plans
          </span>
          <Star className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-3">
          Choose Your{" "}
          <span className="relative">
            <span className="gold-text">Growth Plan</span>
            <span
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #f59e0b, transparent)",
              }}
            />
          </span>
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-4">
          9 premium tiers — from entry-level to Royal class. Fixed daily
          returns, claim every 24 hours, guaranteed payouts.
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Your balance:</span>
          <span className="text-sm font-bold" style={{ color: "#10b981" }}>
            {formatINR(balance)}
          </span>
          {balance === 0 && (
            <Link to="/deposit">
              <Button
                variant="outline"
                size="sm"
                className="text-xs ml-2 h-6"
                style={{
                  borderColor: "rgba(16,185,129,0.4)",
                  color: "#10b981",
                }}
              >
                Deposit Now →
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_PLANS.map((planId, idx) => {
          const plan = INVESTMENT_PLANS[planId];
          const meta = PLAN_META[planId];
          const Icon = meta.icon;
          const canAfford = balance >= plan.amountInvested;
          const isRoyal = planId === "royal";

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="relative"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Outer glow layer for Royal */}
              {isRoyal && (
                <div
                  className="absolute -inset-1 rounded-2xl opacity-50 blur-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #92400e, #f59e0b, #92400e)",
                  }}
                />
              )}

              <Card
                className={`relative h-full border overflow-hidden transition-all duration-300 ${meta.glowClass}`}
                style={{
                  background: meta.gradient,
                  borderColor: meta.borderColor,
                  boxShadow: isRoyal
                    ? "0 0 40px rgba(234,179,8,0.5), 0 0 80px rgba(234,179,8,0.2), inset 0 0 40px rgba(234,179,8,0.03)"
                    : undefined,
                }}
              >
                {/* Shimmer overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${meta.shimmer} 0%, transparent 60%)`,
                  }}
                />

                {/* Badge */}
                {meta.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badgeStyle}`}
                    >
                      {meta.badge}
                    </span>
                  </div>
                )}

                {/* Royal crown decoration */}
                {isRoyal && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #f59e0b, #fcd34d, #f59e0b, transparent)",
                    }}
                  />
                )}

                <CardHeader className="pb-3 pt-6 relative z-10">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accentColor}22 0%, ${meta.accentColor}11 100%)`,
                      border: `1px solid ${meta.accentColor}33`,
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: meta.accentColor }}
                    />
                  </div>

                  <CardTitle className="font-display text-xl">
                    <span style={{ color: meta.accentColor }}>{plan.name}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  {/* Pricing */}
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accentColor}10 0%, transparent 100%)`,
                      border: `1px solid ${meta.accentColor}20`,
                    }}
                  >
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-2xl font-display font-bold text-foreground">
                        {formatINR(plan.amountInvested)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        invest
                      </span>
                    </div>
                    <div
                      className="text-lg font-display font-bold"
                      style={{ color: meta.accentColor }}
                    >
                      {formatINR(plan.dailyReturn)}/day
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      30 days = {formatINR(plan.totalReturn)} total profit
                    </div>
                  </div>

                  <Separator
                    style={{ backgroundColor: `${meta.accentColor}20` }}
                  />

                  {/* Features */}
                  <ul className="space-y-1.5">
                    {meta.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${meta.accentColor}25` }}
                        >
                          <Check
                            className="w-2.5 h-2.5"
                            style={{ color: meta.accentColor }}
                          />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="w-full font-semibold border-0 text-white transition-all duration-200 hover:opacity-90 active:scale-98"
                    style={{
                      background: canAfford
                        ? meta.btnGradient
                        : "rgba(255,255,255,0.08)",
                      opacity: canAfford ? 1 : 0.6,
                      boxShadow: canAfford
                        ? `0 4px 20px ${meta.accentColor}40`
                        : "none",
                    }}
                    onClick={() => handleInvest(planId)}
                    disabled={investMutation.isPending}
                  >
                    {investMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {canAfford
                      ? `Invest ${formatINR(plan.amountInvested)}`
                      : "Insufficient Balance"}
                  </Button>

                  {!canAfford && (
                    <Link to="/deposit">
                      <Button
                        variant="ghost"
                        className="w-full text-xs h-8 mt-0"
                        style={{ color: meta.accentColor }}
                      >
                        Deposit {formatINR(plan.amountInvested - balance)} more
                        →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info footer */}
      <motion.div
        className="mt-12 p-6 rounded-2xl text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-emerald-400" />
            <span>Fixed daily ROI, no market risk</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/50" />
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-violet-400" />
            <span>Claim every 24 hours to your wallet</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/50" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Plans expire after 30 days (4.95x return)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
