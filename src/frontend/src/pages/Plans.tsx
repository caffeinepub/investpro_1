import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCreateInvestment, useUserData } from "@/hooks/useQueries";
import { INVESTMENT_PLANS, formatINR } from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import { Check, Crown, Loader2, Sprout, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const PLAN_META = {
  mini: {
    icon: Sprout,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/20 hover:border-chart-2/40",
    badge: "New",
    features: [
      `${formatINR(82)} daily return`,
      "30-day term",
      `${formatINR(2460)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
    ],
  },
  starter: {
    icon: Zap,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20 hover:border-chart-3/40",
    badge: null,
    features: [
      `${formatINR(165)} daily return`,
      "30-day term",
      `${formatINR(4950)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
    ],
  },
  silver: {
    icon: TrendingUp,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/20 hover:border-chart-2/40",
    badge: "Popular",
    features: [
      `${formatINR(825)} daily return`,
      "30-day term",
      `${formatINR(24750)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
      "Priority support",
    ],
  },
  gold: {
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30 hover:border-primary/60",
    badge: "Best Returns",
    features: [
      `${formatINR(1650)} daily return`,
      "30-day term",
      `${formatINR(49500)} total profit`,
      "Daily claim available",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
};

export function Plans() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();
  const { data: userData } = useUserData(userId);
  const investMutation = useCreateInvestment(userId);

  const balance = userData?.wallet.balance ?? 0;

  async function handleInvest(planId: "mini" | "starter" | "silver" | "gold") {
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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge className="gold-gradient text-primary-foreground border-0 font-bold text-xs mb-4">
          INVESTMENT PLANS
        </Badge>
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          Choose Your <span className="gold-text">Growth Plan</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Select a plan that fits your investment goals. Earn fixed daily
          returns and claim them every 24 hours.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Your balance:</span>
          <span className="text-sm font-bold text-primary">
            {formatINR(balance)}
          </span>
          {balance === 0 && (
            <Link to="/deposit">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-primary/30 text-primary hover:bg-primary/10 ml-2 h-6"
              >
                Deposit Now →
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(["mini", "starter", "silver", "gold"] as const).map((planId, idx) => {
          const plan = INVESTMENT_PLANS[planId];
          const meta = PLAN_META[planId];
          const Icon = meta.icon;
          const canAfford = balance >= plan.amountInvested;
          const isGold = planId === "gold";

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className={isGold ? "relative" : ""}
            >
              {isGold && (
                <div className="absolute -inset-px rounded-xl gold-gradient opacity-30 blur-sm" />
              )}
              <Card
                className={`
                  relative h-full border transition-all duration-300 ${meta.border}
                  ${isGold ? "shadow-gold-lg bg-card" : "bg-card"}
                `}
              >
                {meta.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className={`
                        text-xs font-bold px-3 py-0.5 shadow-md
                        ${
                          isGold
                            ? "gold-gradient text-primary-foreground border-0"
                            : "bg-chart-2/20 text-chart-2 border-chart-2/30"
                        }
                      `}
                    >
                      {meta.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-7">
                  <div className={`p-3 rounded-xl ${meta.bg} w-fit mb-3`}>
                    <Icon className={`w-6 h-6 ${meta.color}`} />
                  </div>
                  <CardTitle className="font-display text-xl">
                    <span className={isGold ? "gold-text" : "text-foreground"}>
                      {plan.name}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Pricing */}
                  <div>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-3xl font-display font-bold text-foreground">
                        {formatINR(plan.amountInvested)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        investment
                      </span>
                    </div>
                    <div
                      className={`text-lg font-display font-bold ${meta.color}`}
                    >
                      {formatINR(plan.dailyReturn)}/day
                    </div>
                    <div className="text-xs text-muted-foreground">
                      for 30 days = {formatINR(plan.totalReturn)} total profit
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Features */}
                  <ul className="space-y-2">
                    {meta.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          className={`w-3.5 h-3.5 flex-shrink-0 ${meta.color}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={`
                      w-full font-semibold transition-all duration-200
                      ${
                        isGold
                          ? "gold-gradient text-primary-foreground border-0 hover:opacity-90 shadow-gold"
                          : canAfford
                            ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                            : "opacity-50"
                      }
                    `}
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
                        className="w-full text-xs text-primary hover:text-primary h-8 mt-0"
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
        className="mt-10 p-5 rounded-xl bg-card border border-border/50 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">How it works:</span>{" "}
          After investing, claim your daily ROI every 24 hours from your
          dashboard. Returns are credited directly to your wallet balance. Plans
          expire after 30 days with a total payout of 4.95x to 4.95x your
          initial investment.
        </p>
      </motion.div>
    </div>
  );
}
