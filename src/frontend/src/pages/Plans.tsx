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
import { useState } from "react";
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
    roiPercent: Math.round((83 / 500) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(83)} daily return`,
      "15-day active term",
      `${formatINR(1250)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  starter: {
    luxuryTag: "BALENCIAGA",
    luxuryHouse: "Avant-Garde Tier",
    roiPercent: Math.round((167 / 1000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(167)} daily return`,
      "15-day active term",
      `${formatINR(2500)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
    ],
  },
  silver: {
    luxuryTag: "HUGO BOSS",
    luxuryHouse: "Corporate Luxury Tier",
    roiPercent: Math.round((833 / 5000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(833)} daily return`,
      "15-day active term",
      `${formatINR(12500)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
    ],
  },
  gold: {
    luxuryTag: "VERSACE",
    luxuryHouse: "Byzantine Gold Tier",
    roiPercent: Math.round((1667 / 10000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(1667)} daily return`,
      "15-day active term",
      `${formatINR(25000)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  diamond: {
    luxuryTag: "TIFFANY & CO.",
    luxuryHouse: "Robin Egg Blue Tier",
    roiPercent: Math.round((4167 / 25000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(4167)} daily return`,
      "15-day active term",
      `${formatINR(62500)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "VIP account manager",
    ],
  },
  platinum: {
    luxuryTag: "LOUIS VUITTON",
    luxuryHouse: "Maison Monogram Tier",
    roiPercent: Math.round((8333 / 50000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(8333)} daily return`,
      "15-day active term",
      `${formatINR(125000)} total profit`,
      "Claim every 24 hours",
      "Instant withdrawals",
      "Dedicated wealth advisor",
      "Priority processing",
    ],
  },
  basic: {
    luxuryTag: "BASIC PLAN",
    luxuryHouse: "Foundation Tier",
    roiPercent: Math.round((333 / 2000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(333)} daily return`,
      "15-day active term",
      `${formatINR(5000)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Easy to start",
    ],
  },
  pro: {
    luxuryTag: "PRO PLAN",
    luxuryHouse: "Growth Tier",
    roiPercent: Math.round((500 / 3000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(500)} daily return`,
      "15-day active term",
      `${formatINR(7500)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Higher daily returns",
    ],
  },
  supreme: {
    luxuryTag: "SUPREME PLAN",
    luxuryHouse: "Excellence Tier",
    roiPercent: Math.round((1250 / 7500) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(1250)} daily return`,
      "15-day active term",
      `${formatINR(18750)} total profit`,
      "Claim every 24 hours",
      "Bank withdrawal support",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  // ── Normal Business Plans ────────────────────────────────
  nb_bronze: {
    luxuryTag: "NB BRONZE",
    luxuryHouse: "Business Entry",
    roiPercent: Math.round((250 / 1500) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(250)} daily return`,
      "15-day active term",
      `${formatINR(3750)} total profit`,
      "Claim every 24 hours",
      "Business account support",
      "Quick onboarding",
    ],
  },
  nb_silver: {
    luxuryTag: "NB SILVER",
    luxuryHouse: "Business Growth",
    roiPercent: Math.round((667 / 4000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(667)} daily return`,
      "15-day active term",
      `${formatINR(10000)} total profit`,
      "Claim every 24 hours",
      "Business account support",
      "Priority processing",
      "Dedicated advisor",
    ],
  },
  nb_gold: {
    luxuryTag: "NB GOLD",
    luxuryHouse: "Business Excellence",
    roiPercent: Math.round((1333 / 8000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(1333)} daily return`,
      "15-day active term",
      `${formatINR(20000)} total profit`,
      "Claim every 24 hours",
      "Business account support",
      "Dedicated account manager",
      "Bulk investment perks",
    ],
  },
  nb_premium: {
    luxuryTag: "NB PREMIUM",
    luxuryHouse: "Business Premium",
    roiPercent: Math.round((2500 / 15000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(2500)} daily return`,
      "15-day active term",
      `${formatINR(37500)} total profit`,
      "Claim every 24 hours",
      "Premium business perks",
      "Priority withdrawals",
      "Executive account manager",
    ],
  },
  nb_elite: {
    luxuryTag: "NB ELITE",
    luxuryHouse: "Business Elite",
    roiPercent: Math.round((5000 / 30000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(5000)} daily return`,
      "15-day active term",
      `${formatINR(75000)} total profit`,
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
    roiPercent: Math.round((3333 / 20000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(3333)} daily return`,
      "15-day active term",
      `${formatINR(50000)} total profit`,
      "Claim every 24 hours",
      "VIP member access",
      "Priority support 24/7",
      "Dedicated VIP manager",
    ],
  },
  vip_gold: {
    luxuryTag: "VIP GOLD",
    luxuryHouse: "VIP Premium",
    roiPercent: Math.round((6667 / 40000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(6667)} daily return`,
      "15-day active term",
      `${formatINR(100000)} total profit`,
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
    roiPercent: Math.round((12500 / 75000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(12500)} daily return`,
      "15-day active term",
      `${formatINR(187500)} total profit`,
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
    roiPercent: Math.round((25000 / 150000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(25000)} daily return`,
      "15-day active term",
      `${formatINR(375000)} total profit`,
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
    roiPercent: Math.round((50000 / 300000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(50000)} daily return`,
      "15-day active term",
      `${formatINR(750000)} total profit`,
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
    roiPercent: Math.round((83333 / 500000) * 100 * 10) / 10,
    multiplier: 2.5,
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
      `${formatINR(83333)} daily return`,
      "15-day active term",
      `${formatINR(1250000)} total profit`,
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
    subtitle: "Entry & growth plans for every investor",
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
    subtitle: "Structured plans for business-minded investors",
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
    subtitle: "Exclusive high-return plans for elite investors",
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
              15 days = {formatINR(plan.totalReturn)} total profit
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
            20 investment plans across 3 sections — Classic, Normal Business,
            and VIP. Fixed daily returns, claim every 24 hours over 15 days.
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
              <span>20 plans across Classic, Business & VIP</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
