import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserId } from "@/hooks/useUserId";
import { getRoyalPassStatus } from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Crown,
  MessageCircle,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const GOLD_PARTICLES = Array.from({ length: 10 }, (_, i) => ({ id: i }));

const ROYAL_PASS_BENEFITS = [
  {
    icon: Zap,
    title: "Fast Withdrawal",
    desc: "Priority processing within 1 hour (vs 24 hrs normal)",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: MessageCircle,
    title: "24/7 VIP Support",
    desc: "Dedicated WhatsApp support line with instant response",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    icon: Crown,
    title: "Exclusive Royal Theme",
    desc: "Premium gold/amber theme unlocks across the entire app",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: Star,
    title: "Priority Plans Access",
    desc: "Early access to new investment plans before everyone else",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: Sparkles,
    title: "Royal Badge",
    desc: "Special Royal Pass crown badge displayed on your profile",
    color: "text-amber-300",
    bg: "bg-amber-300/10",
    border: "border-amber-300/20",
  },
  {
    icon: BarChart3,
    title: "Bonus Features",
    desc: "Unlock advanced dashboard analytics and exclusive tools",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
];

export function RoyalPass() {
  const userId = useUserId();
  const hasRoyalPass = userId ? getRoyalPassStatus(userId) : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Deep black hero background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.06 0.04 75) 0%, oklch(0.04 0.02 285) 40%, oklch(0.08 0.01 285) 100%)",
          }}
        />
        {/* Gold mesh overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.78 0.16 75 / 0.25) 0%, transparent 70%)",
          }}
        />
        {/* Animated shimmer sweep */}
        <motion.div
          className="absolute inset-y-0 w-[30%] pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, oklch(0.78 0.16 75 / 0.04) 40%, oklch(0.78 0.16 75 / 0.10) 50%, oklch(0.78 0.16 75 / 0.04) 60%, transparent 100%)",
          }}
          animate={{ x: ["-100%", "400%"] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            repeatDelay: 2,
          }}
        />

        {/* Floating gold particles */}
        {GOLD_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${8 + p.id * 10}%`,
              bottom: "-4px",
              width: 3 + (p.id % 3),
              height: 3 + (p.id % 3),
              background:
                "radial-gradient(circle, oklch(0.85 0.2 78), oklch(0.72 0.15 75))",
              opacity: 0.6,
            }}
            animate={{
              y: [-0, -80],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2.5 + (p.id % 3) * 0.5,
              delay: p.id * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        ))}

        <div className="relative z-10 px-4 pt-7 pb-8 text-center max-w-2xl mx-auto">
          {/* Crown icon */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="p-4 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.16 75 / 0.2), oklch(0.85 0.2 78 / 0.1))",
                border: "1px solid oklch(0.78 0.16 75 / 0.4)",
                boxShadow:
                  "0 0 40px oklch(0.78 0.16 75 / 0.2), inset 0 1px 0 oklch(0.85 0.22 78 / 0.3)",
              }}
            >
              <Crown
                className="w-10 h-10"
                style={{ color: "oklch(0.85 0.2 78)" }}
              />
            </div>
          </motion.div>

          {/* PRO badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center mb-3"
          >
            <Badge
              className="text-xs font-bold px-3 py-1 border-0 tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.78 0.16 75), oklch(0.85 0.2 78), oklch(0.78 0.16 75))",
                color: "oklch(0.1 0.03 75)",
              }}
            >
              ★ Exclusive Member Access ★
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl font-black mb-2 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.16 75) 0%, oklch(0.9 0.22 82) 50%, oklch(0.78 0.16 75) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ROYAL PASS
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Unlock the full InvestPro experience with priority support, fast
            withdrawals, and exclusive features.
          </motion.p>

          {/* Price tag */}
          <motion.div
            className="flex justify-center items-baseline gap-2 mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span className="text-muted-foreground text-sm">Only</span>
            <span
              className="font-display text-4xl font-black"
              style={{ color: "oklch(0.85 0.2 78)" }}
            >
              ₹1,999
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
          </motion.div>

          {/* CTA or Active state */}
          {hasRoyalPass ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.18 155), oklch(0.68 0.2 160))",
                  color: "oklch(0.06 0.02 290)",
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
                Your Royal Pass is Active
              </div>
              <p className="text-sm" style={{ color: "oklch(0.78 0.16 75)" }}>
                All premium features are unlocked for you
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/deposit"
                search={
                  { royal: "true", amount: "1999" } as Record<string, string>
                }
                data-ocid="royal-pass.primary_button"
              >
                <Button
                  size="lg"
                  className="text-base font-black px-10 py-6 rounded-full border-0 shadow-2xl gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.16 75) 0%, oklch(0.9 0.22 82) 50%, oklch(0.78 0.16 75) 100%)",
                    color: "oklch(0.08 0.03 75)",
                    boxShadow:
                      "0 8px 32px oklch(0.78 0.16 75 / 0.35), 0 0 60px oklch(0.78 0.16 75 / 0.1)",
                  }}
                >
                  <Crown className="w-5 h-5" />
                  Buy Royal Pass – ₹1,999
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                One-time payment • Instant activation • Premium features unlock
                immediately
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.16 75 / 0.4), transparent)",
            }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.78 0.16 75)" }}
          >
            What You Get
          </span>
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.16 75 / 0.4), transparent)",
            }}
          />
        </motion.div>

        <div className="space-y-3">
          {ROYAL_PASS_BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.07 }}
              >
                <Card
                  className={`border ${benefit.border} overflow-hidden`}
                  style={{
                    background: "oklch(0.12 0.022 285)",
                  }}
                >
                  <CardContent className="p-3.5 flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${benefit.bg} ${benefit.border} border`}
                    >
                      <Icon className={`w-4 h-4 ${benefit.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-display font-bold text-sm text-foreground">
                          {benefit.title}
                        </p>
                        {hasRoyalPass && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                    {hasRoyalPass ? (
                      <Badge
                        className="text-[9px] font-bold border-0 flex-shrink-0"
                        style={{
                          background: "oklch(0.72 0.18 155 / 0.15)",
                          color: "oklch(0.72 0.18 155)",
                          border: "1px solid oklch(0.72 0.18 155 / 0.3)",
                        }}
                      >
                        ACTIVE
                      </Badge>
                    ) : (
                      <Badge
                        className="text-[9px] font-bold border-0 flex-shrink-0"
                        style={{
                          background: "oklch(0.78 0.16 75 / 0.12)",
                          color: "oklch(0.78 0.16 75)",
                          border: "1px solid oklch(0.78 0.16 75 / 0.25)",
                        }}
                      >
                        LOCKED
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA (sticky feel) */}
        {!hasRoyalPass && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div
              className="rounded-2xl p-4 mb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.6), oklch(0.08 0.02 285 / 0.8))",
                border: "1px solid oklch(0.78 0.16 75 / 0.25)",
              }}
            >
              <Crown
                className="w-7 h-7 mx-auto mb-2.5"
                style={{ color: "oklch(0.85 0.2 78)" }}
              />
              <p
                className="font-display font-bold text-lg mb-1"
                style={{ color: "oklch(0.85 0.2 78)" }}
              >
                Ready to go Royal?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Join thousands of premium investors with exclusive access
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Instant activation
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  1-hr fast withdraw
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  VIP badge
                </span>
              </div>
              <Link
                to="/deposit"
                search={
                  { royal: "true", amount: "1999" } as Record<string, string>
                }
                data-ocid="royal-pass.submit_button"
              >
                <Button
                  size="lg"
                  className="w-full text-sm font-black py-5 rounded-xl border-0 gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.16 75) 0%, oklch(0.9 0.22 82) 50%, oklch(0.78 0.16 75) 100%)",
                    color: "oklch(0.08 0.03 75)",
                    boxShadow: "0 4px 20px oklch(0.78 0.16 75 / 0.3)",
                  }}
                  data-ocid="royal-pass.secondary_button"
                >
                  <Crown className="w-4 h-4" />
                  Activate Royal Pass – ₹1,999/month
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {hasRoyalPass && (
          <motion.div
            className="mt-5 text-center p-4 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.6), oklch(0.08 0.02 285 / 0.8))",
              border: "1px solid oklch(0.78 0.16 75 / 0.3)",
            }}
          >
            <Crown
              className="w-8 h-8 mx-auto mb-2.5"
              style={{ color: "oklch(0.85 0.2 78)" }}
            />
            <p
              className="font-display font-bold text-lg mb-1"
              style={{ color: "oklch(0.85 0.2 78)" }}
            >
              Royal Pass Active ✓
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              All 6 premium features are unlocked and ready to use
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {ROYAL_PASS_BENEFITS.map((b) => (
                <span
                  key={b.title}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "oklch(0.72 0.18 155 / 0.1)",
                    color: "oklch(0.72 0.18 155)",
                    border: "1px solid oklch(0.72 0.18 155 / 0.2)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {b.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
