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
  Crown,
  Gem,
  Loader2,
  Rocket,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PlanMeta {
  luxuryTag: string;
  luxuryHouse: string;
  roiPercent: number;
  multiplier: number;
  tierFill: number;
  gradient: string;
  overlayGradient: string;
  glowClass: string;
  borderColor: string;
  accentColor: string;
  accentColorSecondary: string;
  btnGradient: string;
  liveDotColor: string;
  labelColor: string;
  features: string[];
}

const PLAN_META: Record<PlanId, PlanMeta> = {
  mini: {
    luxuryTag: "ADIDAS ORIGINALS",
    luxuryHouse: "Streetwear Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 15,
    gradient: "linear-gradient(145deg, #080808 0%, #111111 45%, #0a0a0a 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(255,255,255,0.05) 0%, transparent 55%)",
    glowClass: "plan-glow-adidas",
    borderColor: "rgba(255,255,255,0.18)",
    accentColor: "#ffffff",
    accentColorSecondary: "#cccccc",
    btnGradient: "linear-gradient(135deg, #1a1a1a 0%, #333333 100%)",
    liveDotColor: "#ffffff",
    labelColor: "rgba(255,255,255,0.55)",
    features: [
      `${formatINR(45)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(1450)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  starter: {
    luxuryTag: "BALENCIAGA",
    luxuryHouse: "Avant-Garde Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 26,
    gradient: "linear-gradient(145deg, #141418 0%, #1c1c24 50%, #101014 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom left, rgba(140,140,170,0.07) 0%, transparent 60%)",
    glowClass: "plan-glow-balenciaga",
    borderColor: "rgba(155,155,175,0.2)",
    accentColor: "#c8c8d8",
    accentColorSecondary: "#9898b0",
    btnGradient: "linear-gradient(135deg, #252530 0%, #3a3a4a 100%)",
    liveDotColor: "#c8c8d8",
    labelColor: "rgba(200,200,216,0.5)",
    features: [
      `${formatINR(90)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(2900)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  silver: {
    luxuryTag: "HUGO BOSS",
    luxuryHouse: "Corporate Luxury Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 40,
    gradient: "linear-gradient(145deg, #0e1218 0%, #161e28 50%, #0c1016 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(160,185,210,0.08) 0%, transparent 55%)",
    glowClass: "plan-glow-boss",
    borderColor: "rgba(160,185,210,0.22)",
    accentColor: "#a0c4d8",
    accentColorSecondary: "#7096b0",
    btnGradient: "linear-gradient(135deg, #1a2530 0%, #243545 100%)",
    liveDotColor: "#a0c4d8",
    labelColor: "rgba(160,196,216,0.5)",
    features: [
      `${formatINR(452)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(14500)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
    ],
  },
  gold: {
    luxuryTag: "VERSACE",
    luxuryHouse: "Byzantine Gold Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 54,
    gradient: "linear-gradient(145deg, #100c00 0%, #1e1600 50%, #0e0a00 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(218,165,32,0.12) 0%, transparent 55%)",
    glowClass: "plan-glow-versace",
    borderColor: "rgba(218,165,32,0.32)",
    accentColor: "#daa520",
    accentColorSecondary: "#b8860b",
    btnGradient:
      "linear-gradient(135deg, #3d2800 0%, #7a5000 60%, #b87a00 100%)",
    liveDotColor: "#daa520",
    labelColor: "rgba(218,165,32,0.55)",
    features: [
      `${formatINR(905)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(29000)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  diamond: {
    luxuryTag: "TIFFANY & CO.",
    luxuryHouse: "Robin Egg Blue Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 63,
    gradient: "linear-gradient(145deg, #00100e 0%, #001a18 50%, #000e0c 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom right, rgba(0,195,180,0.1) 0%, transparent 55%)",
    glowClass: "plan-glow-tiffany",
    borderColor: "rgba(0,195,180,0.28)",
    accentColor: "#00c3b4",
    accentColorSecondary: "#009e90",
    btnGradient:
      "linear-gradient(135deg, #003530 0%, #006055 60%, #009e90 100%)",
    liveDotColor: "#00c3b4",
    labelColor: "rgba(0,195,180,0.52)",
    features: [
      `${formatINR(2262)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(72500)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "VIP account manager",
    ],
  },
  platinum: {
    luxuryTag: "LOUIS VUITTON",
    luxuryHouse: "Maison Monogram Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 73,
    gradient: "linear-gradient(145deg, #120900 0%, #1e1000 50%, #100800 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(200,150,50,0.1) 0%, transparent 55%)",
    glowClass: "plan-glow-lv",
    borderColor: "rgba(200,150,50,0.3)",
    accentColor: "#c89632",
    accentColorSecondary: "#a07820",
    btnGradient:
      "linear-gradient(135deg, #2e2000 0%, #5a3c00 60%, #8c6000 100%)",
    liveDotColor: "#c89632",
    labelColor: "rgba(200,150,50,0.52)",
    features: [
      `${formatINR(4524)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(145000)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Instant withdrawals",
      "Dedicated wealth advisor",
      "Priority processing",
    ],
  },
  basic: {
    luxuryTag: "BASIC PLAN",
    luxuryHouse: "Foundation Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 45,
    gradient: "linear-gradient(145deg, #060a14 0%, #0c1424 50%, #060a14 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(59,130,246,0.12) 0%, transparent 55%)",
    glowClass: "plan-glow-basic",
    borderColor: "rgba(59,130,246,0.28)",
    accentColor: "#3b82f6",
    accentColorSecondary: "#2563eb",
    btnGradient:
      "linear-gradient(135deg, #0c1a3a 0%, #1a3a7a 60%, #2563eb 100%)",
    liveDotColor: "#3b82f6",
    labelColor: "rgba(59,130,246,0.55)",
    features: [
      `${formatINR(181)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(5800)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Easy to start",
    ],
  },
  pro: {
    luxuryTag: "PRO PLAN",
    luxuryHouse: "Growth Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 58,
    gradient: "linear-gradient(145deg, #0a0614 0%, #130a24 50%, #0a0614 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom right, rgba(139,92,246,0.12) 0%, transparent 55%)",
    glowClass: "plan-glow-pro",
    borderColor: "rgba(139,92,246,0.3)",
    accentColor: "#8b5cf6",
    accentColorSecondary: "#7c3aed",
    btnGradient:
      "linear-gradient(135deg, #1a0a3a 0%, #3a1a7a 60%, #7c3aed 100%)",
    liveDotColor: "#8b5cf6",
    labelColor: "rgba(139,92,246,0.55)",
    features: [
      `${formatINR(271)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(8700)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Higher daily returns",
    ],
  },
  supreme: {
    luxuryTag: "SUPREME PLAN",
    luxuryHouse: "Excellence Tier",
    roiPercent: 9.0,
    multiplier: 2.9,
    tierFill: 70,
    gradient: "linear-gradient(145deg, #060814 0%, #0a0e24 50%, #060814 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(99,102,241,0.14) 0%, transparent 55%)",
    glowClass: "plan-glow-supreme",
    borderColor: "rgba(99,102,241,0.32)",
    accentColor: "#6366f1",
    accentColorSecondary: "#4f46e5",
    btnGradient:
      "linear-gradient(135deg, #0c0e2e 0%, #24268a 60%, #4f46e5 100%)",
    liveDotColor: "#6366f1",
    labelColor: "rgba(99,102,241,0.55)",
    features: [
      `${formatINR(679)} daily return (9.0%)`,
      "21-day active term",
      `${formatINR(21750)} total profit (2.9x)`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  // ── Normal Business Plans ────────────────────────────────
  nb_bronze: {
    luxuryTag: "NIKE SPORT",
    luxuryHouse: "Performance Drive",
    roiPercent: 11.1,
    multiplier: 3.0,
    tierFill: 20,
    gradient: "linear-gradient(145deg, #130800 0%, #211200 50%, #110600 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(205,127,50,0.14) 0%, transparent 55%)",
    glowClass: "plan-glow-nb-bronze",
    borderColor: "rgba(205,127,50,0.35)",
    accentColor: "#cd7f32",
    accentColorSecondary: "#a0622a",
    btnGradient:
      "linear-gradient(135deg, #2a1500 0%, #5a3010 60%, #a0622a 100%)",
    liveDotColor: "#cd7f32",
    labelColor: "rgba(205,127,50,0.6)",
    features: [
      `${formatINR(167)} daily return (11.1%)`,
      "18-day active term",
      `${formatINR(4500)} total profit (3x)`,
      "Claim every 24 hours",
      "Business account support",
      "Quick onboarding",
    ],
  },
  nb_silver: {
    luxuryTag: "MUFTI EDITION",
    luxuryHouse: "Urban Denim Tier",
    roiPercent: 11.1,
    multiplier: 3.0,
    tierFill: 35,
    gradient: "linear-gradient(145deg, #0d0f14 0%, #161a22 50%, #0b0d12 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom left, rgba(192,192,200,0.1) 0%, transparent 55%)",
    glowClass: "plan-glow-nb-silver",
    borderColor: "rgba(192,192,200,0.3)",
    accentColor: "#c0c0c8",
    accentColorSecondary: "#9898a8",
    btnGradient:
      "linear-gradient(135deg, #1a1c24 0%, #30344a 60%, #48508a 100%)",
    liveDotColor: "#c0c0c8",
    labelColor: "rgba(192,192,200,0.55)",
    features: [
      `${formatINR(444)} daily return (11.1%)`,
      "18-day active term",
      `${formatINR(12000)} total profit (3x)`,
      "Claim every 24 hours",
      "Business account support",
      "Priority processing",
      "Dedicated advisor",
    ],
  },
  nb_gold: {
    luxuryTag: "GUCCI",
    luxuryHouse: "Florentine Excellence",
    roiPercent: 11.1,
    multiplier: 3.0,
    tierFill: 50,
    gradient: "linear-gradient(145deg, #120e00 0%, #201800 50%, #100c00 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(255,200,0,0.12) 0%, transparent 55%)",
    glowClass: "plan-glow-nb-gold",
    borderColor: "rgba(255,200,0,0.3)",
    accentColor: "#ffc800",
    accentColorSecondary: "#d4a000",
    btnGradient:
      "linear-gradient(135deg, #2a2000 0%, #6a5000 60%, #d4a000 100%)",
    liveDotColor: "#ffc800",
    labelColor: "rgba(255,200,0,0.55)",
    features: [
      `${formatINR(889)} daily return (11.1%)`,
      "18-day active term",
      `${formatINR(24000)} total profit (3x)`,
      "Claim every 24 hours",
      "Business account support",
      "Dedicated account manager",
      "Bulk investment perks",
    ],
  },
  nb_premium: {
    luxuryTag: "NB PREMIUM",
    luxuryHouse: "Business Premium",
    roiPercent: 11.1,
    multiplier: 3.0,
    tierFill: 65,
    gradient: "linear-gradient(145deg, #001810 0%, #002818 50%, #001208 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom right, rgba(16,185,129,0.12) 0%, transparent 55%)",
    glowClass: "plan-glow-nb-premium",
    borderColor: "rgba(16,185,129,0.3)",
    accentColor: "#10b981",
    accentColorSecondary: "#059669",
    btnGradient:
      "linear-gradient(135deg, #002818 0%, #065535 60%, #059669 100%)",
    liveDotColor: "#10b981",
    labelColor: "rgba(16,185,129,0.55)",
    features: [
      `${formatINR(1667)} daily return (11.1%)`,
      "18-day active term",
      `${formatINR(45000)} total profit (3x)`,
      "Claim every 24 hours",
      "Premium business perks",
      "Priority withdrawals",
      "Executive account manager",
    ],
  },
  nb_elite: {
    luxuryTag: "NB ELITE",
    luxuryHouse: "Business Elite",
    roiPercent: 11.1,
    multiplier: 3.0,
    tierFill: 80,
    gradient: "linear-gradient(145deg, #001018 0%, #001a28 50%, #000c12 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(6,182,212,0.14) 0%, transparent 55%)",
    glowClass: "plan-glow-nb-elite",
    borderColor: "rgba(6,182,212,0.32)",
    accentColor: "#06b6d4",
    accentColorSecondary: "#0891b2",
    btnGradient:
      "linear-gradient(135deg, #001824 0%, #023a50 60%, #0891b2 100%)",
    liveDotColor: "#06b6d4",
    labelColor: "rgba(6,182,212,0.55)",
    features: [
      `${formatINR(3333)} daily return (11.1%)`,
      "18-day active term",
      `${formatINR(90000)} total profit (3x)`,
      "Claim every 24 hours",
      "Elite business membership",
      "Instant withdrawals",
      "Personal wealth advisor",
      "Business analytics dashboard",
    ],
  },
  // ── VIP Plans ────────────────────────────────────────────
  vip_silver: {
    luxuryTag: "VIP SILVER",
    luxuryHouse: "VIP Entry",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 30,
    gradient: "linear-gradient(145deg, #0c0c10 0%, #181820 50%, #0a0a0e 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(220,220,240,0.1) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-silver",
    borderColor: "rgba(220,220,240,0.3)",
    accentColor: "#dcdcf0",
    accentColorSecondary: "#b0b0d0",
    btnGradient:
      "linear-gradient(135deg, #1c1c2e 0%, #38386a 60%, #5050aa 100%)",
    liveDotColor: "#dcdcf0",
    labelColor: "rgba(220,220,240,0.55)",
    features: [
      `${formatINR(5333)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(100000)} total profit (5x)`,
      "Claim every 24 hours",
      "VIP member access",
      "Priority support 24/7",
      "Dedicated VIP manager",
    ],
  },
  vip_gold: {
    luxuryTag: "LVMH PRESTIGE",
    luxuryHouse: "Maison des Arts",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 45,
    gradient: "linear-gradient(145deg, #160e00 0%, #261800 50%, #140c00 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom left, rgba(245,158,11,0.15) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-gold",
    borderColor: "rgba(245,158,11,0.35)",
    accentColor: "#f59e0b",
    accentColorSecondary: "#d97706",
    btnGradient:
      "linear-gradient(135deg, #2e1c00 0%, #7a4c00 60%, #d97706 100%)",
    liveDotColor: "#f59e0b",
    labelColor: "rgba(245,158,11,0.6)",
    features: [
      `${formatINR(10667)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(200000)} total profit (5x)`,
      "Claim every 24 hours",
      "VIP gold membership",
      "Exclusive investment perks",
      "Personal wealth advisor",
      "Priority processing",
    ],
  },
  vip_platinum: {
    luxuryTag: "VIP PLATINUM",
    luxuryHouse: "VIP Elite",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 58,
    gradient: "linear-gradient(145deg, #080018 0%, #100030 50%, #060010 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top right, rgba(167,139,250,0.15) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-platinum",
    borderColor: "rgba(167,139,250,0.35)",
    accentColor: "#a78bfa",
    accentColorSecondary: "#7c3aed",
    btnGradient:
      "linear-gradient(135deg, #180030 0%, #3a0080 60%, #7c3aed 100%)",
    liveDotColor: "#a78bfa",
    labelColor: "rgba(167,139,250,0.6)",
    features: [
      `${formatINR(20000)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(375000)} total profit (5x)`,
      "Claim every 24 hours",
      "Platinum VIP membership",
      "White-glove support",
      "Personal relationship manager",
      "Instant VIP withdrawals",
    ],
  },
  vip_diamond: {
    luxuryTag: "VIP DIAMOND",
    luxuryHouse: "VIP Prestige",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 68,
    gradient: "linear-gradient(145deg, #00101e 0%, #001c34 50%, #000c16 100%)",
    overlayGradient:
      "radial-gradient(ellipse at bottom right, rgba(56,189,248,0.15) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-diamond",
    borderColor: "rgba(56,189,248,0.35)",
    accentColor: "#38bdf8",
    accentColorSecondary: "#0284c7",
    btnGradient:
      "linear-gradient(135deg, #001c30 0%, #004070 60%, #0284c7 100%)",
    liveDotColor: "#38bdf8",
    labelColor: "rgba(56,189,248,0.6)",
    features: [
      `${formatINR(40000)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(750000)} total profit (5x)`,
      "Claim every 24 hours",
      "Diamond VIP membership",
      "Concierge investment service",
      "Private wealth management",
      "Instant high-limit withdrawals",
    ],
  },
  vip_black: {
    luxuryTag: "VIP BLACK CARD",
    luxuryHouse: "VIP Prestige Black",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 80,
    gradient: "linear-gradient(145deg, #050505 0%, #0c0c0c 50%, #030303 100%)",
    overlayGradient:
      "radial-gradient(ellipse at top left, rgba(255,255,255,0.07) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-black",
    borderColor: "rgba(255,255,255,0.22)",
    accentColor: "#e5e5e5",
    accentColorSecondary: "#aaaaaa",
    btnGradient:
      "linear-gradient(135deg, #141414 0%, #2a2a2a 60%, #4a4a4a 100%)",
    liveDotColor: "#e5e5e5",
    labelColor: "rgba(220,220,220,0.6)",
    features: [
      `${formatINR(80000)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(1500000)} total profit (5x)`,
      "Claim every 24 hours",
      "Black card VIP membership",
      "Ultra-exclusive access",
      "Private banking advisor",
      "Unlimited instant withdrawals",
      "Concierge wealth service",
    ],
  },
  vip_royal: {
    luxuryTag: "VIP ROYAL",
    luxuryHouse: "Supreme Royal Tier",
    roiPercent: 26.7,
    multiplier: 5,
    tierFill: 95,
    gradient: "linear-gradient(145deg, #1a0018 0%, #2e0030 50%, #140010 100%)",
    overlayGradient:
      "radial-gradient(ellipse at center, rgba(236,72,153,0.18) 0%, transparent 55%)",
    glowClass: "plan-glow-vip-royal",
    borderColor: "rgba(236,72,153,0.4)",
    accentColor: "#ec4899",
    accentColorSecondary: "#be185d",
    btnGradient:
      "linear-gradient(135deg, #2e0020 0%, #800040 60%, #be185d 100%)",
    liveDotColor: "#ec4899",
    labelColor: "rgba(236,72,153,0.65)",
    features: [
      `${formatINR(133333)} daily return (26.7%)`,
      "15-day active term",
      `${formatINR(2500000)} total profit (5x)`,
      "Claim every 24 hours",
      "Royal VIP membership",
      "Invite-only tier",
      "Personal royal advisor",
      "Unlimited withdrawals 24/7",
      "Exclusive wealth concierge",
      "Diamond-tier perks included",
    ],
  },
};

// ── Section definitions ────────────────────────────────────────

type SectionId = "classic" | "normal_business" | "vip";

interface PlanSection {
  id: SectionId;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  plans: PlanId[];
  headerGradient: string;
  accentColor: string;
  badgeText: string;
}

const SECTIONS: PlanSection[] = [
  {
    id: "classic",
    label: "Classic",
    subtitle: "Entry & growth plans — 21-day term — 2.9x return",
    icon: <Star className="w-4 h-4" />,
    plans: [
      "mini",
      "starter",
      "basic",
      "silver",
      "pro",
      "gold",
      "supreme",
      "diamond",
      "platinum",
    ],
    headerGradient:
      "linear-gradient(135deg, #daa520 0%, #ff5a14 60%, #daa520 100%)",
    accentColor: "#daa520",
    badgeText: "9 PLANS",
  },
  {
    id: "normal_business",
    label: "Normal Business",
    subtitle:
      "Structured plans for business-minded investors — 18-day term — 3x return",
    icon: <Shield className="w-4 h-4" />,
    plans: ["nb_bronze", "nb_silver", "nb_gold", "nb_premium", "nb_elite"],
    headerGradient:
      "linear-gradient(135deg, #10b981 0%, #06b6d4 60%, #3b82f6 100%)",
    accentColor: "#10b981",
    badgeText: "5 PLANS",
  },
  {
    id: "vip",
    label: "VIP",
    subtitle:
      "Exclusive high-return plans for elite investors — 15-day term — 5x return",
    icon: <Crown className="w-4 h-4" />,
    plans: [
      "vip_silver",
      "vip_gold",
      "vip_platinum",
      "vip_diamond",
      "vip_black",
      "vip_royal",
    ],
    headerGradient:
      "linear-gradient(135deg, #a78bfa 0%, #ec4899 60%, #f59e0b 100%)",
    accentColor: "#a78bfa",
    badgeText: "6 PLANS",
  },
];

// ── Brand Animation CSS ─────────────────────────────────────────

const BRAND_KEYFRAMES = `
@keyframes adidasStripes {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes adidasSweep {
  0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  30%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
}
@keyframes balenciagaScan {
  0%   { transform: translateY(-100%); opacity: 0; }
  15%  { opacity: 0.08; }
  85%  { opacity: 0.08; }
  100% { transform: translateY(200%); opacity: 0; }
}
@keyframes balenciagaB {
  0%, 100% { opacity: 0.04; }
  50%       { opacity: 0.10; }
}
@keyframes bossGrid {
  0%, 100% { opacity: 0.04; }
  50%       { opacity: 0.08; }
}
@keyframes versaceSunburst {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes tiffanyFloat1 {
  0%   { transform: translate(0px, 0px); opacity: 0.7; }
  33%  { transform: translate(6px, -12px); opacity: 1; }
  66%  { transform: translate(-4px, -22px); opacity: 0.6; }
  100% { transform: translate(2px, -36px); opacity: 0; }
}
@keyframes tiffanyFloat2 {
  0%   { transform: translate(0px, 0px); opacity: 0.5; }
  40%  { transform: translate(-8px, -14px); opacity: 0.9; }
  80%  { transform: translate(4px, -28px); opacity: 0.4; }
  100% { transform: translate(-2px, -40px); opacity: 0; }
}
@keyframes tiffanyFloat3 {
  0%   { transform: translate(0px, 0px); opacity: 0.8; }
  50%  { transform: translate(10px, -18px); opacity: 0.6; }
  100% { transform: translate(3px, -34px); opacity: 0; }
}
@keyframes lvScroll {
  0%   { background-position: 0% 0%; }
  100% { background-position: 56px 56px; }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.25; transform: scale(0.95); }
  50%       { opacity: 0.5; transform: scale(1.05); }
}
@keyframes waveFlow {
  0%   { background-position: 0% 80%; }
  50%  { background-position: 100% 80%; }
  100% { background-position: 0% 80%; }
}
@keyframes nikeSwoosh {
  0%   { transform: translateX(-140%) skewX(-24deg); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateX(240%) skewX(-24deg); opacity: 0; }
}
@keyframes muftiDenim {
  0%   { background-position: 0 0; }
  100% { background-position: 80px 80px; }
}
@keyframes gucciRotate {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes lvmhParticle1 {
  0%   { transform: translate(0px, 0px); opacity: 0.8; }
  50%  { transform: translate(12px, -20px); opacity: 0.4; }
  100% { transform: translate(5px, -38px); opacity: 0; }
}
@keyframes lvmhParticle2 {
  0%   { transform: translate(0px, 0px); opacity: 0.6; }
  50%  { transform: translate(-10px, -15px); opacity: 0.9; }
  100% { transform: translate(-3px, -32px); opacity: 0; }
}
@keyframes lvmhParticle3 {
  0%   { transform: translate(0px, 0px); opacity: 0.9; }
  50%  { transform: translate(8px, -24px); opacity: 0.5; }
  100% { transform: translate(14px, -40px); opacity: 0; }
}
@keyframes vipTwinkle {
  0%, 100% { opacity: 0.1; transform: scale(0.6); }
  50%       { opacity: 0.8; transform: scale(1.2); }
}
@keyframes vipShimmer {
  0%   { transform: translateX(-120%) skewX(-12deg); }
  100% { transform: translateX(220%) skewX(-12deg); }
}
@keyframes liveDotPulse {
  0%, 100% { box-shadow: 0 0 0 0px currentColor; }
  50%       { box-shadow: 0 0 0 4px transparent; }
}
`;

type BrandAnimId =
  | "adidas"
  | "balenciaga"
  | "hugo_boss"
  | "versace"
  | "tiffany"
  | "louis_vuitton"
  | "basic_glow"
  | "nb_wave"
  | "nike"
  | "mufti"
  | "gucci"
  | "lvmh"
  | "vip_sparkle";

const PLAN_BRAND_ANIM: Partial<Record<PlanId, BrandAnimId>> = {
  mini: "adidas",
  starter: "balenciaga",
  silver: "hugo_boss",
  gold: "versace",
  diamond: "tiffany",
  platinum: "louis_vuitton",
  basic: "basic_glow",
  pro: "basic_glow",
  supreme: "basic_glow",
  nb_bronze: "nike",
  nb_silver: "mufti",
  nb_gold: "gucci",
  nb_premium: "nb_wave",
  nb_elite: "nb_wave",
  vip_silver: "vip_sparkle",
  vip_gold: "lvmh",
  vip_platinum: "vip_sparkle",
  vip_diamond: "vip_sparkle",
  vip_black: "vip_sparkle",
  vip_royal: "vip_sparkle",
};

function BrandAnimOverlay({
  planId,
  accentColor,
}: {
  planId: PlanId;
  accentColor: string;
}) {
  const animId = PLAN_BRAND_ANIM[planId];
  if (!animId) return null;

  switch (animId) {
    case "adidas":
      return (
        <>
          {/* Three diagonal stripes sweeping across */}
          {(["s0", "s1", "s2"] as const).map((key, i) => (
            <div
              key={key}
              className="absolute inset-y-0 pointer-events-none"
              style={{
                left: `${18 + i * 14}%`,
                width: "8%",
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent 100%)",
                animation: `adidasSweep ${3.5 + i * 0.6}s ease-in-out ${i * 1.1}s infinite`,
              }}
            />
          ))}
        </>
      );

    case "balenciaga":
      return (
        <>
          {/* Bold B watermark */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              right: "10px",
              bottom: "10px",
              fontSize: "96px",
              fontWeight: 900,
              lineHeight: 1,
              color: "rgba(200,200,220,0.08)",
              fontFamily: "serif",
              animation: "balenciagaB 4s ease-in-out infinite",
              userSelect: "none",
            }}
          >
            B
          </div>
          {/* Horizontal scan line */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(200,200,220,0.15), transparent)",
              animation: "balenciagaScan 5s linear infinite",
              top: "0",
            }}
          />
        </>
      );

    case "hugo_boss":
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(160,185,210,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(160,185,210,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            animation: "bossGrid 4s ease-in-out infinite",
          }}
        />
      );

    case "versace":
      return (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: "160px",
            height: "160px",
            transform: "translate(-50%, -50%)",
            animation: "versaceSunburst 12s linear infinite",
          }}
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg) => (
              <div
                key={`ray-${deg}`}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "1px",
                  height: "80px",
                  transformOrigin: "top center",
                  transform: `rotate(${deg}deg) translateX(-50%)`,
                  background:
                    "linear-gradient(180deg, rgba(218,165,32,0.12) 0%, transparent 100%)",
                }}
              />
            ),
          )}
        </div>
      );

    case "tiffany":
      return (
        <>
          {[
            {
              key: "td1",
              left: "20%",
              top: "25%",
              delay: "0s",
              dur: "3.5s",
              anim: "tiffanyFloat1",
            },
            {
              key: "td2",
              left: "60%",
              top: "55%",
              delay: "1.2s",
              dur: "4s",
              anim: "tiffanyFloat2",
            },
            {
              key: "td3",
              left: "75%",
              top: "20%",
              delay: "0.6s",
              dur: "3.2s",
              anim: "tiffanyFloat3",
            },
            {
              key: "td4",
              left: "35%",
              top: "70%",
              delay: "1.8s",
              dur: "3.8s",
              anim: "tiffanyFloat1",
            },
            {
              key: "td5",
              left: "50%",
              top: "40%",
              delay: "2.4s",
              dur: "4.2s",
              anim: "tiffanyFloat2",
            },
          ].map((p) => (
            <div
              key={p.key}
              className="absolute pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#00c3b4",
                boxShadow: "0 0 6px 2px rgba(0,195,180,0.5)",
                animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
        </>
      );

    case "louis_vuitton":
      return (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(200,150,50,0.04) 10px,
                rgba(200,150,50,0.04) 12px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(200,150,50,0.04) 10px,
                rgba(200,150,50,0.04) 12px
              )
            `,
            backgroundSize: "28px 28px",
            animation: "lvScroll 6s linear infinite",
          }}
        />
      );

    case "basic_glow":
      return (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: "180px",
            height: "180px",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
            animation: "glowPulse 3s ease-in-out infinite",
          }}
        />
      );

    case "nb_wave":
      return (
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${accentColor}00 0%, ${accentColor}18 25%, ${accentColor}08 50%, ${accentColor}18 75%, ${accentColor}00 100%)`,
            backgroundSize: "200% 100%",
            animation: "waveFlow 4s ease-in-out infinite",
          }}
        />
      );

    case "nike":
      return (
        <>
          {/* Nike swoosh-style diagonal speed lines */}
          {[
            { k: "n0", left: "25%", w: "10%", dur: "2.8s", delay: "0s" },
            { k: "n1", left: "45%", w: "15%", dur: "3.5s", delay: "1.4s" },
          ].map((line) => (
            <div
              key={line.k}
              className="absolute inset-y-0 pointer-events-none"
              style={{
                left: line.left,
                width: line.w,
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(255,120,0,0.12) 40%, rgba(220,50,0,0.12) 60%, transparent 100%)",
                animation: `nikeSwoosh ${line.dur} ease-in-out ${line.delay} infinite`,
              }}
            />
          ))}
        </>
      );

    case "mufti":
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                -55deg,
                transparent,
                transparent 8px,
                rgba(192,192,200,0.04) 8px,
                rgba(192,192,200,0.04) 10px
              )
            `,
            backgroundSize: "40px 40px",
            animation: "muftiDenim 8s linear infinite",
          }}
        />
      );

    case "gucci":
      return (
        <>
          {/* Interlocking GG-style overlapping circles */}
          {[
            {
              key: "gg1",
              cx: "35%",
              cy: "50%",
              r: "38px",
              delay: "0s",
              dur: "8s",
            },
            {
              key: "gg2",
              cx: "65%",
              cy: "50%",
              r: "38px",
              delay: "0s",
              dur: "11s",
            },
          ].map((c) => (
            <div
              key={c.key}
              className="absolute pointer-events-none"
              style={{
                left: c.cx,
                top: c.cy,
                width: c.r,
                height: c.r,
                transform: "translate(-50%, -50%)",
                border: "2px solid rgba(255,200,0,0.1)",
                borderRadius: "50%",
                animation: `gucciRotate ${c.dur} linear ${c.delay} infinite`,
              }}
            />
          ))}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              width: "70px",
              height: "70px",
              transform: "translate(-50%, -50%)",
              border: "1.5px solid rgba(255,200,0,0.07)",
              borderRadius: "50%",
              animation: "gucciRotate 5s linear reverse infinite",
            }}
          />
        </>
      );

    case "lvmh":
      return (
        <>
          {/* Golden particle field */}
          {[
            {
              key: "lv1",
              left: "15%",
              top: "30%",
              dur: "3.8s",
              delay: "0s",
              anim: "lvmhParticle1",
            },
            {
              key: "lv2",
              left: "50%",
              top: "60%",
              dur: "4.2s",
              delay: "1.0s",
              anim: "lvmhParticle2",
            },
            {
              key: "lv3",
              left: "80%",
              top: "25%",
              dur: "3.4s",
              delay: "0.5s",
              anim: "lvmhParticle3",
            },
            {
              key: "lv4",
              left: "30%",
              top: "75%",
              dur: "4.5s",
              delay: "2.0s",
              anim: "lvmhParticle1",
            },
            {
              key: "lv5",
              left: "70%",
              top: "45%",
              dur: "3.6s",
              delay: "1.5s",
              anim: "lvmhParticle2",
            },
          ].map((p) => (
            <div
              key={p.key}
              className="absolute pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 8px 2px rgba(245,158,11,0.6)",
                animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
          {/* LV-style diamond lattice */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 12px,
                  rgba(245,158,11,0.04) 12px,
                  rgba(245,158,11,0.04) 14px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 12px,
                  rgba(245,158,11,0.04) 12px,
                  rgba(245,158,11,0.04) 14px
                )
              `,
              backgroundSize: "28px 28px",
            }}
          />
        </>
      );

    case "vip_sparkle":
      return (
        <>
          {/* Star/sparkle twinkling field */}
          {[
            { k: "vs1", l: "12%", t: "18%", d: "0s", s: "2.4s" },
            { k: "vs2", l: "28%", t: "65%", d: "0.7s", s: "3.1s" },
            { k: "vs3", l: "48%", t: "32%", d: "1.4s", s: "2.8s" },
            { k: "vs4", l: "68%", t: "72%", d: "0.3s", s: "3.5s" },
            { k: "vs5", l: "82%", t: "22%", d: "1.8s", s: "2.6s" },
            { k: "vs6", l: "90%", t: "55%", d: "1.1s", s: "3.2s" },
            { k: "vs7", l: "55%", t: "88%", d: "2.2s", s: "2.9s" },
          ].map((star) => (
            <div
              key={star.k}
              className="absolute pointer-events-none"
              style={{
                left: star.l,
                top: star.t,
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 6px 2px ${accentColor}80`,
                animation: `vipTwinkle ${star.s} ease-in-out ${star.d} infinite`,
              }}
            />
          ))}
          {/* Shimmer sweep */}
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{
              width: "40%",
              background: `linear-gradient(90deg, transparent, ${accentColor}08, transparent)`,
              animation: "vipShimmer 4s ease-in-out infinite",
            }}
          />
        </>
      );

    default:
      return null;
  }
}

// ── Plan Card Component ─────────────────────────────────────────

interface PlanCardProps {
  planId: PlanId;
  idx: number;
  balance: number;
  onInvest: (planId: PlanId) => void;
  isPending: boolean;
}

function PlanCard({
  planId,
  idx,
  balance,
  onInvest,
  isPending,
}: PlanCardProps) {
  const plan = INVESTMENT_PLANS[planId];
  const meta = PLAN_META[planId];
  const canAfford = balance >= plan.amountInvested;
  const isTop =
    planId === "platinum" || planId === "vip_royal" || planId === "nb_elite";

  return (
    <motion.div
      key={planId}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.45, ease: "easeOut" }}
      className="relative"
      whileHover={{
        y: -6,
        transition: { duration: 0.22, ease: "easeOut" },
      }}
    >
      {isTop && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-50 blur-lg pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${meta.accentColorSecondary}, ${meta.accentColor})`,
          }}
        />
      )}

      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: meta.gradient,
          border: `1px solid ${meta.borderColor}`,
          boxShadow: isTop ? `0 0 30px ${meta.accentColor}25` : undefined,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: meta.overlayGradient }}
        />
        {/* Brand animation overlay */}
        <BrandAnimOverlay planId={planId} accentColor={meta.accentColor} />
        {isTop && (
          <div
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${meta.accentColor}, transparent)`,
            }}
          />
        )}

        <div className="relative z-10 p-5 flex flex-col gap-4">
          {/* Top bar */}
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
                style={{ backgroundColor: meta.liveDotColor }}
              />
              <span
                className="font-sans text-[10px] font-semibold"
                style={{ color: meta.labelColor }}
              >
                LIVE
              </span>
            </div>
          </div>

          {/* Plan name */}
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

          {/* ROI badge */}
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

          {/* Pricing block */}
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
              {plan.termDays} days = {formatINR(plan.totalReturn)} total profit
            </div>
          </div>

          {/* Tier bar */}
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
                className="h-full rounded-full"
                style={{
                  width: `${meta.tierFill}%`,
                  background: `linear-gradient(90deg, ${meta.accentColorSecondary}, ${meta.accentColor})`,
                }}
              />
            </div>
          </div>

          {/* 24h indicator */}
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

          <Separator style={{ backgroundColor: `${meta.accentColor}18` }} />

          {/* Features */}
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

          {/* CTA */}
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
            }}
            onClick={() => onInvest(planId)}
            disabled={isPending || !canAfford}
          >
            {isPending ? (
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
                className="w-full py-2 text-[11px] font-sans font-medium tracking-wide text-center opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: meta.accentColor }}
              >
                Deposit {formatINR(plan.amountInvested - balance)} more →
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Plans Page ─────────────────────────────────────────────

export function Plans() {
  const userId = useUserId();
  const { data: userData } = useUserData(userId);
  const investMutation = useCreateInvestment(userId);
  const [activeSection, setActiveSection] = useState<SectionId>("classic");

  // Inject brand animation keyframes once into <head>
  useEffect(() => {
    const styleId = "investpro-brand-keyframes";
    if (document.getElementById(styleId)) return;
    const el = document.createElement("style");
    el.id = styleId;
    el.textContent = BRAND_KEYFRAMES;
    document.head.appendChild(el);
    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

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

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* ── Editorial Header ── */}
      <motion.div
        className="mb-10 relative"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative text-center space-y-4">
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
              }}
            >
              Collection 2026
            </span>
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </div>

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

          <p
            className="font-sans text-sm max-w-lg mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            20 investment plans across 3 sections — Classic 2.9x (21 days),
            Normal Business 3x (18 days), VIP 5x (15 days). Fixed daily returns,
            claim every 24 hours.
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Balance</span>
              <span style={{ color: "#daa520", fontWeight: 700 }}>
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

      {/* ── Section Tabs ── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          className="flex gap-2 p-1.5 rounded-2xl overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className="flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-display font-black text-sm tracking-wide whitespace-nowrap"
                style={{
                  background: isActive ? section.headerGradient : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  boxShadow: isActive
                    ? `0 4px 20px ${section.accentColor}30`
                    : "none",
                }}
              >
                <span
                  style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.4)" }}
                >
                  {section.icon}
                </span>
                <span>{section.label}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-sm font-black tracking-widest"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.06)",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {section.badgeText}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Section Header Banner ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-8 rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentSection.accentColor}10 0%, transparent 60%)`,
            border: `1px solid ${currentSection.accentColor}20`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: currentSection.headerGradient,
                boxShadow: `0 4px 20px ${currentSection.accentColor}40`,
              }}
            >
              <span style={{ color: "#fff" }}>{currentSection.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-display font-black text-lg tracking-wide"
                  style={{
                    background: currentSection.headerGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {currentSection.label.toUpperCase()} PLANS
                </h2>
                <span
                  className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-sm"
                  style={{
                    background: `${currentSection.accentColor}20`,
                    color: currentSection.accentColor,
                    border: `1px solid ${currentSection.accentColor}30`,
                  }}
                >
                  {currentSection.badgeText}
                </span>
              </div>
              <p
                className="font-sans text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {currentSection.subtitle}
              </p>
            </div>
          </div>
          {/* Decorative glow */}
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: currentSection.accentColor }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Plan Cards Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}_grid`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {currentSection.plans.map((planId, idx) => (
            <PlanCard
              key={planId}
              planId={planId}
              idx={idx}
              balance={balance}
              onInvest={handleInvest}
              isPending={investMutation.isPending}
            />
          ))}
        </motion.div>
      </AnimatePresence>

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
              <Zap className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span>Classic 21d · Business 18d · VIP 15d</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
