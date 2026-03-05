// Local state simulation layer for the investment engine
// All data persisted to localStorage, keyed by user principal

export type PlanId =
  | "mini"
  | "starter"
  | "silver"
  | "gold"
  | "diamond"
  | "platinum"
  | "basic"
  | "pro"
  | "supreme"
  // Normal Business plans
  | "nb_bronze"
  | "nb_silver"
  | "nb_gold"
  | "nb_premium"
  | "nb_elite"
  // VIP plans
  | "vip_silver"
  | "vip_gold"
  | "vip_platinum"
  | "vip_diamond"
  | "vip_black"
  | "vip_royal";

export interface Investment {
  id: string;
  planId: PlanId;
  planName: string;
  amountInvested: number;
  dailyReturn: number;
  startDate: number;
  lastClaimDate: number;
  daysCompleted: number;
  totalEarned: number;
  status: "Active" | "Expired";
}

export interface Transaction {
  id: string;
  type: "ROI" | "Deposit" | "Withdrawal";
  amount: number;
  description: string;
  timestamp: number;
  status: "Pending" | "Success" | "Failed";
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  utr: string;
  screenshotDataUrl: string;
  requestedAt: number;
  status: "Pending" | "Approved" | "Rejected";
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankDetails: BankProfile;
  requestedAt: number;
  status: "Pending" | "Approved" | "Rejected";
}

export interface BankProfile {
  accountNumber: string;
  holderName: string;
  ifscCode: string;
  isLinked: boolean;
}

export interface UserWallet {
  balance: number;
  totalWithdrawn: number;
  totalDeposited: number;
  totalROIEarned: number;
}

export interface UserData {
  wallet: UserWallet;
  investments: Investment[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  bankProfile: BankProfile;
}

export const INVESTMENT_PLANS = {
  // ── Classic Plans (2.9x return, 21 days) ─────────────────
  mini: {
    id: "mini" as const,
    name: "Mini",
    amountInvested: 500,
    dailyReturn: 45,
    termDays: 21,
    totalReturn: 1450,
    color: "chart-2",
    description: "Start small, grow big",
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    amountInvested: 1000,
    dailyReturn: 90,
    termDays: 21,
    totalReturn: 2900,
    color: "chart-3",
    description: "Perfect for beginners",
  },
  silver: {
    id: "silver" as const,
    name: "Silver",
    amountInvested: 5000,
    dailyReturn: 452,
    termDays: 21,
    totalReturn: 14500,
    color: "chart-2",
    description: "For serious investors",
  },
  gold: {
    id: "gold" as const,
    name: "Gold",
    amountInvested: 10000,
    dailyReturn: 905,
    termDays: 21,
    totalReturn: 29000,
    color: "gold",
    description: "Maximum returns",
  },
  diamond: {
    id: "diamond" as const,
    name: "Diamond",
    amountInvested: 25000,
    dailyReturn: 2262,
    termDays: 21,
    totalReturn: 72500,
    color: "cyan",
    description: "Elite growth tier",
  },
  platinum: {
    id: "platinum" as const,
    name: "Platinum",
    amountInvested: 50000,
    dailyReturn: 4524,
    termDays: 21,
    totalReturn: 145000,
    color: "violet",
    description: "Accelerated wealth",
  },
  basic: {
    id: "basic" as const,
    name: "Basic",
    amountInvested: 2000,
    dailyReturn: 181,
    termDays: 21,
    totalReturn: 5800,
    color: "blue",
    description: "Simple and steady growth",
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    amountInvested: 3000,
    dailyReturn: 271,
    termDays: 21,
    totalReturn: 8700,
    color: "purple",
    description: "Professional-grade returns",
  },
  supreme: {
    id: "supreme" as const,
    name: "Supreme",
    amountInvested: 7500,
    dailyReturn: 679,
    termDays: 21,
    totalReturn: 21750,
    color: "indigo",
    description: "Supreme value for smart investors",
  },
  // ── Normal Business Plans (3x return, 18 days) ──────────
  nb_bronze: {
    id: "nb_bronze" as const,
    name: "NB Bronze",
    amountInvested: 1500,
    dailyReturn: 167,
    termDays: 18,
    totalReturn: 4500,
    color: "orange",
    description: "Normal Business entry plan",
  },
  nb_silver: {
    id: "nb_silver" as const,
    name: "NB Silver",
    amountInvested: 4000,
    dailyReturn: 444,
    termDays: 18,
    totalReturn: 12000,
    color: "slate",
    description: "Steady business growth",
  },
  nb_gold: {
    id: "nb_gold" as const,
    name: "NB Gold",
    amountInvested: 8000,
    dailyReturn: 889,
    termDays: 18,
    totalReturn: 24000,
    color: "yellow",
    description: "Business gold tier returns",
  },
  nb_premium: {
    id: "nb_premium" as const,
    name: "NB Premium",
    amountInvested: 15000,
    dailyReturn: 1667,
    termDays: 18,
    totalReturn: 45000,
    color: "emerald",
    description: "Premium business accelerator",
  },
  nb_elite: {
    id: "nb_elite" as const,
    name: "NB Elite",
    amountInvested: 30000,
    dailyReturn: 3333,
    termDays: 18,
    totalReturn: 90000,
    color: "teal",
    description: "Elite business wealth builder",
  },
  // ── VIP Plans (5x return, 15 days) ──────────────────────
  vip_silver: {
    id: "vip_silver" as const,
    name: "VIP Silver",
    amountInvested: 20000,
    dailyReturn: 5333,
    termDays: 15,
    totalReturn: 100000,
    color: "gray",
    description: "VIP entry — exclusive returns",
  },
  vip_gold: {
    id: "vip_gold" as const,
    name: "VIP Gold",
    amountInvested: 40000,
    dailyReturn: 10667,
    termDays: 15,
    totalReturn: 200000,
    color: "amber",
    description: "VIP gold — premium wealth",
  },
  vip_platinum: {
    id: "vip_platinum" as const,
    name: "VIP Platinum",
    amountInvested: 75000,
    dailyReturn: 20000,
    termDays: 15,
    totalReturn: 375000,
    color: "cyan",
    description: "VIP platinum — elite wealth",
  },
  vip_diamond: {
    id: "vip_diamond" as const,
    name: "VIP Diamond",
    amountInvested: 150000,
    dailyReturn: 40000,
    termDays: 15,
    totalReturn: 750000,
    color: "sky",
    description: "VIP diamond — ultra wealth",
  },
  vip_black: {
    id: "vip_black" as const,
    name: "VIP Black",
    amountInvested: 300000,
    dailyReturn: 80000,
    termDays: 15,
    totalReturn: 1500000,
    color: "zinc",
    description: "VIP black card — prestige tier",
  },
  vip_royal: {
    id: "vip_royal" as const,
    name: "VIP Royal",
    amountInvested: 500000,
    dailyReturn: 133333,
    termDays: 15,
    totalReturn: 2500000,
    color: "rose",
    description: "VIP royal — supreme wealth",
  },
};

const ADMIN_SAMPLE_DATA_KEY = "__investpro_admin_sample__";
const GLOBAL_WITHDRAWALS_KEY = "__investpro_global_withdrawals__";
const GLOBAL_DEPOSITS_KEY = "__investpro_global_deposits__";
const REFERRAL_MAP_KEY = "__investpro_referral_map__";
const REFERRAL_EARNINGS_KEY = "__investpro_ref_earnings__";
const USED_UTRS_KEY = "__investpro_used_utrs__";

function getUsedUTRs(): Set<string> {
  const raw = localStorage.getItem(USED_UTRS_KEY);
  if (!raw) return new Set();
  return new Set(JSON.parse(raw) as string[]);
}

function markUTRAsUsed(utr: string): void {
  const set = getUsedUTRs();
  set.add(utr.trim().toLowerCase());
  localStorage.setItem(USED_UTRS_KEY, JSON.stringify([...set]));
}

function getStorageKey(userId: string): string {
  return `investpro_user_${userId}`;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_WALLET: UserWallet = {
  balance: 0,
  totalWithdrawn: 0,
  totalDeposited: 0,
  totalROIEarned: 0,
};

const DEFAULT_BANK: BankProfile = {
  accountNumber: "",
  holderName: "",
  ifscCode: "",
  isLinked: false,
};

// ── Sample admin data ────────────────────────────────────────

function initAdminSampleData() {
  const existing = localStorage.getItem(ADMIN_SAMPLE_DATA_KEY);
  if (existing) return;

  // Create sample users
  const sampleUsers = ["user_demo_1", "user_demo_2", "user_demo_3"];

  const sampleNames = ["Rahul Sharma", "Priya Patel", "Amit Kumar"];
  const sampleBanks: BankProfile[] = [
    {
      accountNumber: "1234567890",
      holderName: "Rahul Sharma",
      ifscCode: "HDFC0001234",
      isLinked: true,
    },
    {
      accountNumber: "9876543210",
      holderName: "Priya Patel",
      ifscCode: "ICIC0005678",
      isLinked: true,
    },
    {
      accountNumber: "1122334455",
      holderName: "Amit Kumar",
      ifscCode: "SBIN0009012",
      isLinked: true,
    },
  ];

  sampleUsers.forEach((userId, idx) => {
    const key = getStorageKey(userId);
    if (localStorage.getItem(key)) return;

    const now = Date.now();
    const daysAgo = (d: number) => now - d * 24 * 60 * 60 * 1000;

    const inv1: Investment = {
      id: generateId(),
      planId: idx === 0 ? "gold" : idx === 1 ? "silver" : "starter",
      planName: idx === 0 ? "Gold" : idx === 1 ? "Silver" : "Starter",
      amountInvested: idx === 0 ? 10000 : idx === 1 ? 5000 : 1000,
      dailyReturn: idx === 0 ? 1650 : idx === 1 ? 825 : 165,
      startDate: daysAgo(10),
      lastClaimDate: daysAgo(1),
      daysCompleted: 10,
      totalEarned: idx === 0 ? 16500 : idx === 1 ? 8250 : 1650,
      status: "Active",
    };

    const data: UserData = {
      wallet: {
        balance: idx === 0 ? 18500 : idx === 1 ? 9500 : 2500,
        totalWithdrawn: idx === 0 ? 5000 : idx === 1 ? 2000 : 0,
        totalDeposited: idx === 0 ? 10000 : idx === 1 ? 5000 : 1000,
        totalROIEarned: idx === 0 ? 16500 : idx === 1 ? 8250 : 1650,
      },
      investments: [inv1],
      transactions: [
        {
          id: generateId(),
          type: "Deposit",
          amount: idx === 0 ? 10000 : idx === 1 ? 5000 : 1000,
          description: "Initial deposit",
          timestamp: daysAgo(12),
          status: "Success",
        },
        {
          id: generateId(),
          type: "ROI",
          amount: idx === 0 ? 16500 : idx === 1 ? 8250 : 1650,
          description: `Daily ROI - ${inv1.planName} Plan`,
          timestamp: daysAgo(1),
          status: "Success",
        },
      ],
      withdrawalRequests:
        idx === 0
          ? [
              {
                id: generateId(),
                userId,
                userName: sampleNames[idx],
                amount: 5000,
                bankDetails: sampleBanks[idx],
                requestedAt: daysAgo(1),
                status: "Pending",
              },
            ]
          : [],
      bankProfile: sampleBanks[idx],
    };

    localStorage.setItem(key, JSON.stringify(data));
    // Store user info for admin panel
    const userMeta = JSON.parse(
      localStorage.getItem("investpro_user_meta") || "{}",
    );
    userMeta[userId] = { name: sampleNames[idx], id: userId };
    localStorage.setItem("investpro_user_meta", JSON.stringify(userMeta));
  });

  localStorage.setItem(ADMIN_SAMPLE_DATA_KEY, "1");
}

// ── Core CRUD ────────────────────────────────────────────────

export function loadUserData(userId: string): UserData {
  initAdminSampleData();
  const raw = localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return {
      wallet: { ...DEFAULT_WALLET },
      investments: [],
      transactions: [],
      withdrawalRequests: [],
      bankProfile: { ...DEFAULT_BANK },
    };
  }
  return JSON.parse(raw) as UserData;
}

export function saveUserData(userId: string, data: UserData): void {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

// ── Wallet operations ────────────────────────────────────────

export function depositToWallet(
  userId: string,
  amount: number,
  description = "Deposit",
): UserData {
  const data = loadUserData(userId);
  data.wallet.balance += amount;
  data.wallet.totalDeposited += amount;
  data.transactions.unshift({
    id: generateId(),
    type: "Deposit",
    amount,
    description,
    timestamp: Date.now(),
    status: "Success",
  });
  saveUserData(userId, data);
  return data;
}

export function createInvestment(
  userId: string,
  planId: PlanId,
): { success: boolean; message: string; data?: UserData } {
  const plan = INVESTMENT_PLANS[planId];
  const data = loadUserData(userId);

  if (data.wallet.balance < plan.amountInvested) {
    return {
      success: false,
      message: `Insufficient balance. You need ₹${plan.amountInvested.toLocaleString("en-IN")} to invest in the ${plan.name} plan.`,
    };
  }

  const now = Date.now();
  const investment: Investment = {
    id: generateId(),
    planId,
    planName: plan.name,
    amountInvested: plan.amountInvested,
    dailyReturn: plan.dailyReturn,
    startDate: now,
    lastClaimDate: now,
    daysCompleted: 0,
    totalEarned: 0,
    status: "Active",
  };

  data.wallet.balance -= plan.amountInvested;
  data.investments.unshift(investment);
  data.transactions.unshift({
    id: generateId(),
    type: "Withdrawal",
    amount: plan.amountInvested,
    description: `Investment - ${plan.name} Plan`,
    timestamp: now,
    status: "Success",
  });
  saveUserData(userId, data);
  return { success: true, message: "Investment created successfully!", data };
}

export function claimROI(
  userId: string,
  investmentId: string,
): { success: boolean; message: string; data?: UserData } {
  const data = loadUserData(userId);
  const inv = data.investments.find((i) => i.id === investmentId);
  if (!inv) return { success: false, message: "Investment not found" };
  if (inv.status === "Expired")
    return { success: false, message: "This investment has expired" };

  const now = Date.now();
  const hoursSinceClaim = (now - inv.lastClaimDate) / (1000 * 60 * 60);

  if (hoursSinceClaim < 24) {
    const hoursLeft = Math.ceil(24 - hoursSinceClaim);
    return {
      success: false,
      message: `Next claim available in ${hoursLeft} hour(s)`,
    };
  }

  const plan = INVESTMENT_PLANS[inv.planId];
  const termDays = plan?.termDays ?? 15;
  const daysSinceStart = Math.floor(
    (now - inv.startDate) / (1000 * 60 * 60 * 24),
  );
  const totalDays = Math.min(daysSinceStart + 1, termDays);
  const claimAmount = inv.dailyReturn;

  inv.totalEarned += claimAmount;
  inv.lastClaimDate = now;
  inv.daysCompleted = totalDays;
  if (totalDays >= termDays) inv.status = "Expired";

  data.wallet.balance += claimAmount;
  data.wallet.totalROIEarned += claimAmount;
  data.transactions.unshift({
    id: generateId(),
    type: "ROI",
    amount: claimAmount,
    description: `Daily ROI - ${inv.planName} Plan (Day ${totalDays})`,
    timestamp: now,
    status: "Success",
  });

  saveUserData(userId, data);
  return {
    success: true,
    message: `₹${claimAmount.toLocaleString("en-IN")} ROI claimed!`,
    data,
  };
}

export function requestWithdrawal(
  userId: string,
  userName: string,
  amount: number,
): { success: boolean; message: string; data?: UserData } {
  const data = loadUserData(userId);

  if (!data.bankProfile.isLinked) {
    return { success: false, message: "Please link your bank account first" };
  }
  if (data.wallet.balance < amount) {
    return { success: false, message: "Insufficient balance" };
  }
  if (amount < 100) {
    return { success: false, message: "Minimum withdrawal amount is ₹100" };
  }

  const request: WithdrawalRequest = {
    id: generateId(),
    userId,
    userName,
    amount,
    bankDetails: data.bankProfile,
    requestedAt: Date.now(),
    status: "Pending",
  };

  data.wallet.balance -= amount;
  data.withdrawalRequests.unshift(request);
  data.transactions.unshift({
    id: generateId(),
    type: "Withdrawal",
    amount,
    description: `Withdrawal request to ${data.bankProfile.accountNumber.slice(-4).padStart(data.bankProfile.accountNumber.length, "*")}`,
    timestamp: Date.now(),
    status: "Pending",
  });

  saveUserData(userId, data);

  // Push to global withdrawal list for admin
  const global = getGlobalWithdrawals();
  global.unshift({ ...request, userId });
  localStorage.setItem(GLOBAL_WITHDRAWALS_KEY, JSON.stringify(global));

  return { success: true, message: "Withdrawal request submitted!", data };
}

export function saveBankProfile(
  userId: string,
  bank: Omit<BankProfile, "isLinked">,
): UserData {
  const data = loadUserData(userId);
  data.bankProfile = { ...bank, isLinked: true };
  saveUserData(userId, data);
  return data;
}

// ── Deposit request operations ───────────────────────────────

export function submitDepositRequest(
  userId: string,
  userName: string,
  amount: number,
  utr: string,
  screenshotDataUrl: string,
): {
  success: boolean;
  message: string;
  requestId?: string;
  autoApproved?: boolean;
} {
  if (!utr.trim()) {
    return {
      success: false,
      message: "Please enter the UTR / transaction reference",
    };
  }

  // Reject duplicate UTRs
  if (getUsedUTRs().has(utr.trim().toLowerCase())) {
    return {
      success: false,
      message:
        "This UTR has already been used. Duplicate transactions are not allowed.",
    };
  }

  const requestId = generateId();
  const request: DepositRequest = {
    id: requestId,
    userId,
    userName,
    amount,
    utr: utr.trim(),
    screenshotDataUrl,
    requestedAt: Date.now(),
    status: "Approved",
  };

  // Save to global list with Approved status (for admin records)
  const global = getGlobalDeposits();
  global.unshift(request);
  localStorage.setItem(GLOBAL_DEPOSITS_KEY, JSON.stringify(global));

  // Mark UTR as used to prevent duplicate submissions
  markUTRAsUsed(utr);

  // Auto-credit wallet immediately
  const data = loadUserData(userId);
  data.wallet.balance += amount;
  data.wallet.totalDeposited += amount;
  data.transactions.unshift({
    id: generateId(),
    type: "Deposit",
    amount,
    description: `Deposit ₹${amount.toLocaleString("en-IN")} — Auto-approved (UTR: ${utr.trim()})`,
    timestamp: Date.now(),
    status: "Success",
  });
  saveUserData(userId, data);

  // Credit referral bonus if applicable
  creditReferralBonus(userId, amount);

  return {
    success: true,
    message: "Payment verified and wallet credited!",
    requestId,
    autoApproved: true,
  };
}

export function getGlobalDeposits(): DepositRequest[] {
  const raw = localStorage.getItem(GLOBAL_DEPOSITS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as DepositRequest[];
}

export function approveDeposit(requestId: string): void {
  const global = getGlobalDeposits();
  const req = global.find((r) => r.id === requestId);
  if (!req) return;

  const updated = global.map((r) =>
    r.id === requestId ? { ...r, status: "Approved" as const } : r,
  );
  localStorage.setItem(GLOBAL_DEPOSITS_KEY, JSON.stringify(updated));

  // Credit wallet and update transaction
  const userData = loadUserData(req.userId);
  userData.wallet.balance += req.amount;
  userData.wallet.totalDeposited += req.amount;

  // Find the pending deposit transaction and mark it Success
  const tx = userData.transactions.find(
    (t) =>
      t.type === "Deposit" && t.status === "Pending" && t.amount === req.amount,
  );
  if (tx) tx.status = "Success";

  saveUserData(req.userId, userData);

  // Credit referral bonus if applicable
  creditReferralBonus(req.userId, req.amount);
}

export function rejectDeposit(requestId: string): void {
  const global = getGlobalDeposits();
  const req = global.find((r) => r.id === requestId);
  if (!req) return;

  const updated = global.map((r) =>
    r.id === requestId ? { ...r, status: "Rejected" as const } : r,
  );
  localStorage.setItem(GLOBAL_DEPOSITS_KEY, JSON.stringify(updated));

  // Mark transaction as Failed
  const userData = loadUserData(req.userId);
  const tx = userData.transactions.find(
    (t) =>
      t.type === "Deposit" && t.status === "Pending" && t.amount === req.amount,
  );
  if (tx) tx.status = "Failed";
  saveUserData(req.userId, userData);
}

// ── Admin operations ─────────────────────────────────────────

export function getGlobalWithdrawals(): WithdrawalRequest[] {
  const raw = localStorage.getItem(GLOBAL_WITHDRAWALS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as WithdrawalRequest[];
}

export function getAllUsersData(): Array<{
  userId: string;
  name: string;
  data: UserData;
}> {
  initAdminSampleData();
  const meta = JSON.parse(
    localStorage.getItem("investpro_user_meta") || "{}",
  ) as Record<string, { name: string; id: string }>;
  return Object.entries(meta).map(([userId, info]) => ({
    userId,
    name: info.name,
    data: loadUserData(userId),
  }));
}

export function approveWithdrawal(requestId: string): void {
  const global = getGlobalWithdrawals();
  const req = global.find((r) => r.id === requestId);
  if (!req) return;

  // Update global list
  const updated = global.map((r) =>
    r.id === requestId ? { ...r, status: "Approved" as const } : r,
  );
  localStorage.setItem(GLOBAL_WITHDRAWALS_KEY, JSON.stringify(updated));

  // Update user data
  const userData = loadUserData(req.userId);
  const withdrawal = userData.withdrawalRequests.find(
    (w) => w.id === requestId,
  );
  if (withdrawal) {
    withdrawal.status = "Approved";
    userData.wallet.totalWithdrawn += withdrawal.amount;
    // Update matching transaction
    const tx = userData.transactions.find(
      (t) =>
        t.type === "Withdrawal" &&
        t.status === "Pending" &&
        t.amount === withdrawal.amount,
    );
    if (tx) tx.status = "Success";
  }
  saveUserData(req.userId, userData);
}

export function rejectWithdrawal(requestId: string): void {
  const global = getGlobalWithdrawals();
  const req = global.find((r) => r.id === requestId);
  if (!req) return;

  // Update global list
  const updated = global.map((r) =>
    r.id === requestId ? { ...r, status: "Rejected" as const } : r,
  );
  localStorage.setItem(GLOBAL_WITHDRAWALS_KEY, JSON.stringify(updated));

  // Update user data and refund balance
  const userData = loadUserData(req.userId);
  const withdrawal = userData.withdrawalRequests.find(
    (w) => w.id === requestId,
  );
  if (withdrawal) {
    withdrawal.status = "Rejected";
    userData.wallet.balance += withdrawal.amount; // refund
    const tx = userData.transactions.find(
      (t) =>
        t.type === "Withdrawal" &&
        t.status === "Pending" &&
        t.amount === withdrawal.amount,
    );
    if (tx) tx.status = "Failed";
  }
  saveUserData(req.userId, userData);
}

// ── Helpers ──────────────────────────────────────────────────

export function canClaimROI(investment: Investment): boolean {
  const hoursSinceClaim =
    (Date.now() - investment.lastClaimDate) / (1000 * 60 * 60);
  return hoursSinceClaim >= 24 && investment.status === "Active";
}

export function timeUntilNextClaim(investment: Investment): string {
  const hoursSinceClaim =
    (Date.now() - investment.lastClaimDate) / (1000 * 60 * 60);
  const hoursLeft = 24 - hoursSinceClaim;
  if (hoursLeft <= 0) return "Ready to claim";
  const h = Math.floor(hoursLeft);
  const m = Math.floor((hoursLeft - h) * 60);
  return `${h}h ${m}m`;
}

export function registerUserMeta(userId: string, name: string): void {
  const meta = JSON.parse(localStorage.getItem("investpro_user_meta") || "{}");
  meta[userId] = { name, id: userId };
  localStorage.setItem("investpro_user_meta", JSON.stringify(meta));
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Referral System ──────────────────────────────────────────

export function getReferralLink(userId: string): string {
  const base = window.location.origin;
  const code = getOrCreateShortCode(userId);
  return `${base}?ref=${code}`;
}

export function registerWithReferral(
  newUserId: string,
  referrerCode: string,
): void {
  const map = JSON.parse(
    localStorage.getItem(REFERRAL_MAP_KEY) || "{}",
  ) as Record<string, string>;
  if (!map[newUserId]) {
    map[newUserId] = referrerCode;
    localStorage.setItem(REFERRAL_MAP_KEY, JSON.stringify(map));
  }
}

export function getReferralStats(
  userId: string,
): Array<{ friendId: string; joinedAt: number; totalProfit: number }> {
  const map = JSON.parse(
    localStorage.getItem(REFERRAL_MAP_KEY) || "{}",
  ) as Record<string, string>;
  const earnings = JSON.parse(
    localStorage.getItem(REFERRAL_EARNINGS_KEY) || "{}",
  ) as Record<string, Record<string, number>>;
  const friendEarnings = earnings[userId] || {};
  const friends = Object.entries(map)
    .filter(([, ref]) => ref === userId)
    .map(([friendId]) => ({
      friendId,
      joinedAt: Date.now(),
      totalProfit: friendEarnings[friendId] || 0,
    }));
  return friends;
}

// ── Withdrawal day restriction ───────────────────────────────

/**
 * Returns true if withdrawals are allowed today.
 * Withdrawals are ONLY allowed on Sunday (0) and Monday (1).
 * Tuesday (2) through Saturday (6) are BLOCKED.
 */
export function isWithdrawalAllowedToday(): boolean {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return day === 0 || day === 1;
}

export function getWithdrawalBlockedMessage(): string {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = new Date().getDay();
  if (day >= 2 && day <= 6)
    return `Withdrawals are only available on Sundays and Mondays. Today is ${dayNames[day]} — please come back on Sunday or Monday to withdraw.`;
  return "";
}

// ── Short Referral Code ──────────────────────────────────────

const SHORT_CODE_MAP_KEY = "__investpro_short_code_map__"; // userId -> shortCode
const SHORT_CODE_REVERSE_KEY = "__investpro_short_code_reverse__"; // shortCode -> userId

/** Generate or retrieve a user's short referral code (6 chars alphanumeric uppercase) */
export function getOrCreateShortCode(userId: string): string {
  const map = JSON.parse(
    localStorage.getItem(SHORT_CODE_MAP_KEY) || "{}",
  ) as Record<string, string>;
  if (map[userId]) return map[userId];

  // Deterministic generation from userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let h = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    code += chars[h % chars.length];
    h = Math.floor(h / chars.length);
    if (h === 0) h = Math.abs(hash * (i + 1337));
  }

  // Check collision
  const reverse = JSON.parse(
    localStorage.getItem(SHORT_CODE_REVERSE_KEY) || "{}",
  ) as Record<string, string>;
  let finalCode = code;
  let suffix = 0;
  while (reverse[finalCode] && reverse[finalCode] !== userId) {
    finalCode = code.slice(0, 5) + chars[suffix % chars.length];
    suffix++;
  }

  map[userId] = finalCode;
  reverse[finalCode] = userId;
  localStorage.setItem(SHORT_CODE_MAP_KEY, JSON.stringify(map));
  localStorage.setItem(SHORT_CODE_REVERSE_KEY, JSON.stringify(reverse));
  return finalCode;
}

export function lookupUserByShortCode(code: string): string | null {
  const reverse = JSON.parse(
    localStorage.getItem(SHORT_CODE_REVERSE_KEY) || "{}",
  ) as Record<string, string>;
  return reverse[code.toUpperCase().trim()] || null;
}

export function hasReferrer(userId: string): boolean {
  const map = JSON.parse(
    localStorage.getItem(REFERRAL_MAP_KEY) || "{}",
  ) as Record<string, string>;
  return !!map[userId];
}

// ── Multi-level Referral Bonus ───────────────────────────────
// Level 1 (direct inviter)        → 10%
// Level 2 (inviter of inviter)    →  7%
// Level 3 (inviter of level-2)    →  1%

// ── User Profile ─────────────────────────────────────────────

const USER_PROFILE_KEY = "__investpro_user_profiles__";

export interface UserProfile {
  userId: string; // unique short ID like "IP-83726"
  phone: string;
  displayName: string;
  joinedAt: number;
  tier: "Classic" | "NormalBusiness" | "VIP" | null;
}

function generateUserId(): string {
  return `IP-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function getUserProfile(phone: string): UserProfile | null {
  const all = JSON.parse(
    localStorage.getItem(USER_PROFILE_KEY) || "{}",
  ) as Record<string, UserProfile>;
  return all[phone] || null;
}

export function saveUserProfile(
  phone: string,
  updates: Partial<Omit<UserProfile, "userId" | "phone" | "joinedAt">>,
): UserProfile {
  const all = JSON.parse(
    localStorage.getItem(USER_PROFILE_KEY) || "{}",
  ) as Record<string, UserProfile>;
  const existing = all[phone];
  const profile: UserProfile = existing || {
    userId: generateUserId(),
    phone,
    displayName: `User ${phone.slice(-4)}`,
    joinedAt: Date.now(),
    tier: null,
  };
  Object.assign(profile, updates);
  all[phone] = profile;
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(all));
  return profile;
}

export function getUserTier(
  investments: Investment[],
): "Classic" | "NormalBusiness" | "VIP" | null {
  const active = investments.filter((i) => i.status === "Active");
  if (active.length === 0) return null;
  const vipIds: PlanId[] = [
    "vip_silver",
    "vip_gold",
    "vip_platinum",
    "vip_diamond",
    "vip_black",
    "vip_royal",
  ];
  const nbIds: PlanId[] = [
    "nb_bronze",
    "nb_silver",
    "nb_gold",
    "nb_premium",
    "nb_elite",
  ];
  if (active.some((i) => vipIds.includes(i.planId))) return "VIP";
  if (active.some((i) => nbIds.includes(i.planId))) return "NormalBusiness";
  return "Classic";
}

// ── Royal Pass ───────────────────────────────────────────────

const ROYAL_PASS_KEY = "investpro_royal_pass";

export function getRoyalPassStatus(userId: string): boolean {
  try {
    const data = JSON.parse(localStorage.getItem(ROYAL_PASS_KEY) || "{}");
    return data[userId] === true;
  } catch {
    return false;
  }
}

export function setRoyalPassActive(userId: string): void {
  try {
    const data = JSON.parse(localStorage.getItem(ROYAL_PASS_KEY) || "{}");
    data[userId] = true;
    localStorage.setItem(ROYAL_PASS_KEY, JSON.stringify(data));
  } catch {}
}

export function creditReferralBonus(
  depositUserId: string,
  depositAmount: number,
): void {
  const map = JSON.parse(
    localStorage.getItem(REFERRAL_MAP_KEY) || "{}",
  ) as Record<string, string>;

  const levels: Array<{ pct: number; label: string }> = [
    { pct: 0.1, label: "Referral bonus (Level 1 – 10%) from friend deposit" },
    {
      pct: 0.07,
      label: "Referral bonus (Level 2 – 7%) from 2nd-level friend deposit",
    },
    {
      pct: 0.01,
      label: "Referral bonus (Level 3 – 1%) from 3rd-level friend deposit",
    },
  ];

  const earnings = JSON.parse(
    localStorage.getItem(REFERRAL_EARNINGS_KEY) || "{}",
  ) as Record<string, Record<string, number>>;

  let currentUserId = depositUserId;
  const now = Date.now();

  for (const { pct, label } of levels) {
    const referrerId = map[currentUserId];
    if (!referrerId) break;

    const bonus = Math.floor(depositAmount * pct);
    if (bonus > 0) {
      // Credit referrer's wallet
      const referrerData = loadUserData(referrerId);
      referrerData.wallet.balance += bonus;
      referrerData.wallet.totalROIEarned += bonus;
      referrerData.transactions.unshift({
        id: `${now}_ref_${pct}`,
        type: "ROI",
        amount: bonus,
        description: label,
        timestamp: now,
        status: "Success",
      });
      saveUserData(referrerId, referrerData);

      // Track per-friend earnings
      if (!earnings[referrerId]) earnings[referrerId] = {};
      earnings[referrerId][depositUserId] =
        (earnings[referrerId][depositUserId] || 0) + bonus;
    }

    currentUserId = referrerId; // walk up the chain
  }

  localStorage.setItem(REFERRAL_EARNINGS_KEY, JSON.stringify(earnings));
}
