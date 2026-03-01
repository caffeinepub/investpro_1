// Platform-wide settings store for InvestPro admin
// All data persisted to localStorage

export interface PlatformSettings {
  maxWithdrawal: number; // default 11000
  adminWhatsApp: string; // default "9813983483"
  supportEmail: string; // default "warisbhaimewati@gmail.com"
  supportWhatsApp: string; // default "9813983483"
  upiId: string; // default "9813983483-2.wallet@phonepe"
  bankAccount: string; // default "7871001700092453"
  bankIfsc: string; // default "PUNB0787100"
  bankName: string; // default "Punjab National Bank"
}

export interface BroadcastNotice {
  id: string;
  message: string;
  createdAt: number;
  type: "info" | "warning" | "success";
}

export interface PlanOverride {
  planId: "mini" | "starter" | "silver" | "gold";
  dailyReturn: number;
  amountInvested: number;
  termDays?: number;
}

const PLATFORM_SETTINGS_KEY = "__investpro_platform_settings__";
const NOTICES_KEY = "__investpro_notices__";
const PLAN_OVERRIDES_KEY = "__investpro_plan_overrides__";

const DEFAULT_SETTINGS: PlatformSettings = {
  maxWithdrawal: 11000,
  adminWhatsApp: "9813983483",
  supportEmail: "warisbhaimewati@gmail.com",
  supportWhatsApp: "9813983483",
  upiId: "9813983483-2.wallet@phonepe",
  bankAccount: "7871001700092453",
  bankIfsc: "PUNB0787100",
  bankName: "Punjab National Bank",
};

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Platform Settings ────────────────────────────────────────

export function getPlatformSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(PLATFORM_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<PlatformSettings>),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function savePlatformSettings(settings: PlatformSettings): void {
  localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(settings));
}

export function resetPlatformSettings(): void {
  localStorage.removeItem(PLATFORM_SETTINGS_KEY);
}

// ── Broadcast Notices ────────────────────────────────────────

export function getBroadcastNotices(): BroadcastNotice[] {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BroadcastNotice[];
  } catch {
    return [];
  }
}

export function addBroadcastNotice(
  notice: Omit<BroadcastNotice, "id" | "createdAt">,
): BroadcastNotice {
  const newNotice: BroadcastNotice = {
    ...notice,
    id: generateId(),
    createdAt: Date.now(),
  };
  const existing = getBroadcastNotices();
  existing.unshift(newNotice);
  localStorage.setItem(NOTICES_KEY, JSON.stringify(existing));
  return newNotice;
}

export function deleteBroadcastNotice(id: string): void {
  const existing = getBroadcastNotices();
  const filtered = existing.filter((n) => n.id !== id);
  localStorage.setItem(NOTICES_KEY, JSON.stringify(filtered));
}

// ── Plan Overrides ───────────────────────────────────────────

export function getPlanOverrides(): PlanOverride[] {
  try {
    const raw = localStorage.getItem(PLAN_OVERRIDES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlanOverride[];
  } catch {
    return [];
  }
}

export function savePlanOverride(override: PlanOverride): void {
  const existing = getPlanOverrides();
  const idx = existing.findIndex((p) => p.planId === override.planId);
  if (idx >= 0) {
    existing[idx] = override;
  } else {
    existing.push(override);
  }
  localStorage.setItem(PLAN_OVERRIDES_KEY, JSON.stringify(existing));
}

export function deletePlanOverride(planId: PlanOverride["planId"]): void {
  const existing = getPlanOverrides();
  const filtered = existing.filter((p) => p.planId !== planId);
  localStorage.setItem(PLAN_OVERRIDES_KEY, JSON.stringify(filtered));
}
