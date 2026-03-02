import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateInvestment, useUserData } from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import {
  INVESTMENT_PLANS,
  type PlanId,
  formatINR,
} from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Check,
  Clock,
  Gem,
  Loader2,
  Rocket,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PlanMeta {
  luxuryTag: string;
  luxuryHouse: string;
  roiPercent: number;
  multiplier: number;
  tierFill: number;
  gradient: string;
  overlayGradient: string;
  textureClass: string;
  glowClass: string;
  borderColor: string;
  accentColor: string;
  accentColorSecondary: string;
  btnGradient: string;
  liveDotColor: string;
  sweepColor: string;
  labelColor: string;
  features: string[];
}

const PLAN_META: Record<PlanId, PlanMeta> = {
  mini: {
    luxuryTag: "ADIDAS ORIGINALS",
    luxuryHouse: "Streetwear Tier",
    roiPercent: Math.round((164 / 500) * 100 * 10) / 10,
    multiplier: Math.round(((500 + 2460) / 500) * 10) / 10,
    tierFill: 15,
    gradient: "linear-gradient(145deg, #080808 0%, #111111 45%, #0a0a0a 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(255,255,255,0.05) 0%, transparent 55%)",
    textureClass: "texture-adidas",
    glowClass: "plan-glow-adidas",
    borderColor: "rgba(255,255,255,0.18)",
    accentColor: "#ffffff",
    accentColorSecondary: "#cccccc",
    btnGradient: "linear-gradient(135deg, #1a1a1a 0%, #333333 100%)",
    liveDotColor: "#ffffff",
    sweepColor: "rgba(255,255,255,0.08)",
    labelColor: "rgba(255,255,255,0.55)",
    features: [
      `${formatINR(164)} daily return`,
      "15-day active term",
      `${formatINR(2460)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  starter: {
    luxuryTag: "BALENCIAGA",
    luxuryHouse: "Avant-Garde Tier",
    roiPercent: Math.round((330 / 1000) * 100 * 10) / 10,
    multiplier: Math.round(((1000 + 4950) / 1000) * 10) / 10,
    tierFill: 26,
    gradient: "linear-gradient(145deg, #141418 0%, #1c1c24 50%, #101014 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom left, rgba(140,140,170,0.07) 0%, transparent 60%)",
    textureClass: "texture-balenciaga",
    glowClass: "plan-glow-balenciaga",
    borderColor: "rgba(155,155,175,0.2)",
    accentColor: "#c8c8d8",
    accentColorSecondary: "#9898b0",
    btnGradient: "linear-gradient(135deg, #252530 0%, #3a3a4a 100%)",
    liveDotColor: "#c8c8d8",
    sweepColor: "rgba(155,155,175,0.07)",
    labelColor: "rgba(200,200,216,0.5)",
    features: [
      `${formatINR(330)} daily return`,
      "15-day active term",
      `${formatINR(4950)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  silver: {
    luxuryTag: "HUGO BOSS",
    luxuryHouse: "Corporate Luxury Tier",
    roiPercent: Math.round((1650 / 5000) * 100 * 10) / 10,
    multiplier: Math.round(((5000 + 24750) / 5000) * 10) / 10,
    tierFill: 40,
    gradient: "linear-gradient(145deg, #0e1218 0%, #161e28 50%, #0c1016 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(160,185,210,0.08) 0%, transparent 55%)",
    textureClass: "texture-boss",
    glowClass: "plan-glow-boss",
    borderColor: "rgba(160,185,210,0.22)",
    accentColor: "#a0c4d8",
    accentColorSecondary: "#7096b0",
    btnGradient: "linear-gradient(135deg, #1a2530 0%, #243545 100%)",
    liveDotColor: "#a0c4d8",
    sweepColor: "rgba(160,185,210,0.07)",
    labelColor: "rgba(160,196,216,0.5)",
    features: [
      `${formatINR(1650)} daily return`,
      "15-day active term",
      `${formatINR(24750)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
    ],
  },
  gold: {
    luxuryTag: "VERSACE",
    luxuryHouse: "Byzantine Gold Tier",
    roiPercent: Math.round((3300 / 10000) * 100 * 10) / 10,
    multiplier: Math.round(((10000 + 49500) / 10000) * 10) / 10,
    tierFill: 54,
    gradient: "linear-gradient(145deg, #100c00 0%, #1e1600 50%, #0e0a00 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(218,165,32,0.12) 0%, transparent 55%)",
    textureClass: "texture-versace",
    glowClass: "plan-glow-versace",
    borderColor: "rgba(218,165,32,0.32)",
    accentColor: "#daa520",
    accentColorSecondary: "#b8860b",
    btnGradient:
      "linear-gradient(135deg, #3d2800 0%, #7a5000 60%, #b87a00 100%)",
    liveDotColor: "#daa520",
    sweepColor: "rgba(218,165,32,0.08)",
    labelColor: "rgba(218,165,32,0.55)",
    features: [
      `${formatINR(3300)} daily return`,
      "15-day active term",
      `${formatINR(49500)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  diamond: {
    luxuryTag: "TIFFANY & CO.",
    luxuryHouse: "Robin Egg Blue Tier",
    roiPercent: Math.round((8250 / 25000) * 100 * 10) / 10,
    multiplier: Math.round(((25000 + 123750) / 25000) * 10) / 10,
    tierFill: 63,
    gradient: "linear-gradient(145deg, #00100e 0%, #001a18 50%, #000e0c 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom right, rgba(0,195,180,0.1) 0%, transparent 55%)",
    textureClass: "texture-tiffany",
    glowClass: "plan-glow-tiffany",
    borderColor: "rgba(0,195,180,0.28)",
    accentColor: "#00c3b4",
    accentColorSecondary: "#009e90",
    btnGradient:
      "linear-gradient(135deg, #003530 0%, #006055 60%, #009e90 100%)",
    liveDotColor: "#00c3b4",
    sweepColor: "rgba(0,195,180,0.07)",
    labelColor: "rgba(0,195,180,0.52)",
    features: [
      `${formatINR(8250)} daily return`,
      "15-day active term",
      `${formatINR(123750)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "VIP account manager",
    ],
  },
  platinum: {
    luxuryTag: "LOUIS VUITTON",
    luxuryHouse: "Maison Monogram Tier",
    roiPercent: Math.round((16500 / 50000) * 100 * 10) / 10,
    multiplier: Math.round(((50000 + 247500) / 50000) * 10) / 10,
    tierFill: 73,
    gradient: "linear-gradient(145deg, #120900 0%, #1e1000 50%, #100800 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(200,150,50,0.1) 0%, transparent 55%)",
    textureClass: "texture-lv",
    glowClass: "plan-glow-lv",
    borderColor: "rgba(200,150,50,0.3)",
    accentColor: "#c89632",
    accentColorSecondary: "#a07820",
    btnGradient:
      "linear-gradient(135deg, #2e2000 0%, #5a3c00 60%, #8c6000 100%)",
    liveDotColor: "#c89632",
    sweepColor: "rgba(200,150,50,0.07)",
    labelColor: "rgba(200,150,50,0.52)",
    features: [
      `${formatINR(16500)} daily return`,
      "15-day active term",
      `${formatINR(247500)} total profit`,
      "Claim every 24 hours",
      "Instant withdrawals",
      "Dedicated wealth advisor",
      "Priority processing",
    ],
  },
  elite: {
    luxuryTag: "GUCCI",
    luxuryHouse: "House of Flora Tier",
    roiPercent: Math.round((33000 / 100000) * 100 * 10) / 10,
    multiplier: Math.round(((100000 + 495000) / 100000) * 10) / 10,
    tierFill: 82,
    gradient: "linear-gradient(145deg, #031006 0%, #051a08 50%, #021008 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(0,145,55,0.1) 0%, transparent 55%)",
    textureClass: "texture-gucci",
    glowClass: "plan-glow-gucci",
    borderColor: "rgba(0,145,55,0.28)",
    accentColor: "#00a83c",
    accentColorSecondary: "#008030",
    btnGradient:
      "linear-gradient(135deg, #051a08 0%, #0a3010 60%, #0f5020 100%)",
    liveDotColor: "#00a83c",
    sweepColor: "rgba(0,145,55,0.07)",
    labelColor: "rgba(0,168,60,0.52)",
    features: [
      `${formatINR(33000)} daily return`,
      "15-day active term",
      `${formatINR(495000)} total profit`,
      "Claim every 24 hours",
      "Instant withdrawals",
      "Private wealth manager",
      "24/7 concierge support",
    ],
  },
  vip: {
    luxuryTag: "PRADA",
    luxuryHouse: "Re-Nylon Tier",
    roiPercent: Math.round((82500 / 250000) * 100 * 10) / 10,
    multiplier: Math.round(((250000 + 1237500) / 250000) * 10) / 10,
    tierFill: 90,
    gradient: "linear-gradient(145deg, #050506 0%, #0a0a0d 50%, #040405 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom left, rgba(200,200,230,0.05) 0%, transparent 55%)",
    textureClass: "texture-prada",
    glowClass: "plan-glow-prada",
    borderColor: "rgba(200,200,225,0.14)",
    accentColor: "#d0d0e8",
    accentColorSecondary: "#a0a0c0",
    btnGradient:
      "linear-gradient(135deg, #0e0e14 0%, #1e1e2e 60%, #2e2e42 100%)",
    liveDotColor: "#d0d0e8",
    sweepColor: "rgba(200,200,230,0.05)",
    labelColor: "rgba(200,200,230,0.45)",
    features: [
      `${formatINR(82500)} daily return`,
      "15-day active term",
      `${formatINR(1237500)} total profit`,
      "Instant withdrawals",
      "Private banker assigned",
      "VIP lounge access",
      "Exclusive investment events",
    ],
  },
  royal: {
    luxuryTag: "HERMÈS × SUPREME",
    luxuryHouse: "The Pinnacle Tier",
    roiPercent: Math.round((165000 / 500000) * 100 * 10) / 10,
    multiplier: Math.round(((500000 + 2475000) / 500000) * 10) / 10,
    tierFill: 100,
    gradient:
      "linear-gradient(145deg, #150400 0%, #280800 40%, #3a0c00 70%, #1a0400 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(255,75,10,0.15) 0%, transparent 55%)",
    textureClass: "texture-hermes",
    glowClass: "plan-glow-royal",
    borderColor: "rgba(255,90,20,0.4)",
    accentColor: "#ff5a14",
    accentColorSecondary: "#e03000",
    btnGradient:
      "linear-gradient(135deg, #6b0f00 0%, #c42000 50%, #ff3800 100%)",
    liveDotColor: "#ff5a14",
    sweepColor: "rgba(255,90,20,0.1)",
    labelColor: "rgba(255,90,20,0.6)",
    features: [
      `${formatINR(165000)} daily return`,
      "15-day active term",
      `${formatINR(2475000)} total profit`,
      "Instant withdrawals",
      "Personal wealth strategist",
      "Unlimited concierge service",
      "Exclusive private investment club",
      "Zero fee transactions",
    ],
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
  const userId = useUserId();
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
      {/* ── Editorial Header ── */}
      <motion.div
        className="mb-16 relative"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative background rule */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px opacity-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.4) 80%, transparent 100%)",
          }}
        />

        <div className="relative text-center space-y-4">
          {/* Eyebrow tag — editorial style */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
            <span
              className="text-[10px] font-display font-black tracking-[0.28em] uppercase px-3 py-1 rounded-sm"
              style={{
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                letterSpacing: "0.28em",
              }}
            >
              Collection 2026
            </span>
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </div>

          {/* Main editorial headline */}
          <div>
            <h1
              className="font-display font-black leading-[0.9] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
            >
              <span
                className="block"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                INVEST
              </span>
              <span
                className="block"
                style={{
                  background:
                    "linear-gradient(135deg, #daa520 0%, #ff5a14 55%, #daa520 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                IN LUXURY
              </span>
            </h1>
          </div>

          {/* Subhead */}
          <p
            className="font-sans text-sm max-w-lg mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Nine exclusive tiers. Each a world of its own. Fixed daily returns —
            claim every 24 hours over 15 days.
          </p>

          {/* Balance pill */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Balance</span>
              <span
                style={{
                  color: "#daa520",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 700,
                }}
              >
                {formatINR(balance)}
              </span>
            </div>
            {balance === 0 && (
              <Link to="/deposit">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 rounded-full border-white/20 text-white/60 hover:border-white/40 hover:text-white/90"
                >
                  Deposit →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Plan Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_PLANS.map((planId, idx) => {
          const plan = INVESTMENT_PLANS[planId];
          const meta = PLAN_META[planId];
          const canAfford = balance >= plan.amountInvested;
          const isRoyal = planId === "royal";

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.5, ease: "easeOut" }}
              className="relative"
              whileHover={{
                y: -6,
                transition: { duration: 0.22, ease: "easeOut" },
              }}
            >
              {/* Royal outer glow halo */}
              {isRoyal && (
                <div
                  className="absolute -inset-1 rounded-2xl opacity-60 blur-lg pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #6b0f00, #ff5a14, #6b0f00)",
                  }}
                />
              )}

              {/* Card shell */}
              <div
                className={`luxury-card-shimmer relative h-full rounded-2xl overflow-hidden transition-all duration-300 ${meta.glowClass} ${meta.textureClass}`}
                style={{
                  background: meta.gradient,
                  border: `1px solid ${meta.borderColor}`,
                }}
              >
                {/* Overlay gradient for depth */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: meta.overlayGradient }}
                />

                {/* Gucci red-green accent bar on left */}
                {planId === "elite" && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, #cc1a1a 0%, #cc1a1a 50%, #1a7a1a 50%, #1a7a1a 100%)",
                    }}
                  />
                )}

                {/* Royal top accent line */}
                {isRoyal && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #ff5a14, #ffaa00, #ff5a14, transparent)",
                    }}
                  />
                )}

                {/* Card content */}
                <div className="relative z-10 p-5 flex flex-col gap-4">
                  {/* ── Top bar: luxury tag + live dot ── */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display font-black text-[9px] tracking-[0.22em] uppercase"
                      style={{ color: meta.labelColor }}
                    >
                      {meta.luxuryTag}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="live-dot w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: meta.liveDotColor,
                          color: meta.liveDotColor,
                        }}
                      />
                      <span
                        className="font-sans text-[10px] font-semibold"
                        style={{ color: meta.labelColor }}
                      >
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* ── Plan name + house subtitle ── */}
                  <div>
                    <h2
                      className="font-display font-black text-2xl leading-none tracking-[-0.01em] mb-0.5"
                      style={{ color: meta.accentColor }}
                    >
                      {plan.name.toUpperCase()}
                    </h2>
                    <p
                      className="font-sans text-[10px] tracking-wider uppercase"
                      style={{ color: meta.labelColor }}
                    >
                      {meta.luxuryHouse}
                    </p>
                  </div>

                  {/* ── ROI badge + multiplier ── */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-sm"
                      style={{
                        background: `${meta.accentColor}18`,
                        border: `1px solid ${meta.accentColor}30`,
                      }}
                    >
                      <TrendingUp
                        className="w-3 h-3"
                        style={{ color: meta.accentColor }}
                      />
                      <span
                        className="font-display font-black text-[11px]"
                        style={{ color: meta.accentColor }}
                      >
                        {meta.roiPercent}% DAILY ROI
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-sm"
                      style={{
                        background: `${meta.accentColor}10`,
                        border: `1px solid ${meta.accentColor}22`,
                      }}
                    >
                      <span
                        className="font-display font-black text-[11px]"
                        style={{ color: meta.accentColorSecondary }}
                      >
                        {meta.multiplier}x
                      </span>
                    </div>
                  </div>

                  {/* ── Pricing block ── */}
                  <div
                    className="rounded-xl p-3.5"
                    style={{
                      background: `${meta.accentColor}0c`,
                      border: `1px solid ${meta.accentColor}1e`,
                    }}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span
                          className="font-display font-black text-xl leading-none"
                          style={{ color: "rgba(255,255,255,0.92)" }}
                        >
                          {formatINR(plan.amountInvested)}
                        </span>
                        <span
                          className="font-sans text-[10px] ml-1.5"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          invest
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="font-display font-bold text-base"
                          style={{ color: meta.accentColor }}
                        >
                          {formatINR(plan.dailyReturn)}
                        </span>
                        <span
                          className="font-sans text-[10px] ml-1"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          /day
                        </span>
                      </div>
                    </div>
                    <div
                      className="font-sans text-[10px]"
                      style={{ color: "rgba(255,255,255,0.32)" }}
                    >
                      15 days = {formatINR(plan.totalReturn)} total profit
                    </div>
                  </div>

                  {/* ── Tier progress bar ── */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="font-sans text-[10px] tracking-wider uppercase"
                        style={{ color: meta.labelColor }}
                      >
                        Tier Exclusivity
                      </span>
                      <span
                        className="font-display font-bold text-[10px]"
                        style={{ color: meta.accentColor }}
                      >
                        {meta.tierFill}%
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: `${meta.accentColor}18` }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${meta.tierFill}%`,
                          background: `linear-gradient(90deg, ${meta.accentColorSecondary}, ${meta.accentColor})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── 24h claim indicator ── */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      background: `${meta.accentColor}0a`,
                      border: `1px solid ${meta.accentColor}18`,
                    }}
                  >
                    <Clock
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: meta.accentColor }}
                    />
                    <span
                      className="font-sans text-[11px]"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      24h cycle — claim daily returns to wallet
                    </span>
                  </div>

                  <Separator
                    style={{ backgroundColor: `${meta.accentColor}18` }}
                  />

                  {/* ── Features list ── */}
                  <ul className="space-y-1.5">
                    {meta.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-[12px]"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${meta.accentColor}22` }}
                        >
                          <Check
                            className="w-2 h-2"
                            style={{ color: meta.accentColor }}
                          />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* ── CTA Button ── */}
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl font-display font-black text-[13px] tracking-[0.06em] uppercase transition-all duration-200 active:scale-95"
                    style={{
                      background: canAfford
                        ? meta.btnGradient
                        : "rgba(255,255,255,0.06)",
                      color: canAfford ? "#ffffff" : "rgba(255,255,255,0.3)",
                      border: canAfford
                        ? `1px solid ${meta.accentColor}40`
                        : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: canAfford
                        ? `0 4px 20px ${meta.accentColor}30, inset 0 1px 0 rgba(255,255,255,0.08)`
                        : "none",
                      cursor: canAfford ? "pointer" : "not-allowed",
                      transform: canAfford ? undefined : "none",
                    }}
                    onClick={() => handleInvest(planId)}
                    disabled={investMutation.isPending || !canAfford}
                    onMouseEnter={(e) => {
                      if (canAfford) {
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "scale(1.01)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "scale(1)";
                    }}
                  >
                    {investMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Activating…
                      </span>
                    ) : canAfford ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Tap to Invest {formatINR(plan.amountInvested)}
                      </span>
                    ) : (
                      "Insufficient Balance"
                    )}
                  </button>

                  {!canAfford && (
                    <Link to="/deposit">
                      <button
                        type="button"
                        className="w-full py-2 text-[11px] font-sans font-medium tracking-wide text-center transition-opacity hover:opacity-100 opacity-60"
                        style={{ color: meta.accentColor }}
                      >
                        Deposit {formatINR(plan.amountInvested - balance)} more
                        →
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Info footer ── */}
      <motion.div
        className="mt-14 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div
          className="p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <div
              className="flex items-center gap-2.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Gem className="w-4 h-4" style={{ color: "#daa520" }} />
              <span>Fixed daily ROI, no market risk</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div
              className="flex items-center gap-2.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Rocket className="w-4 h-4" style={{ color: "#00c3b4" }} />
              <span>Claim every 24 hours to your wallet</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div
              className="flex items-center gap-2.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Star className="w-4 h-4" style={{ color: "#ff5a14" }} />
              <span>Plans expire after 15 days — fast returns</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
