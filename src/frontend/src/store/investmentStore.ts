// Local state simulation layer for the investment engine
// All data persisted to localStorage, keyed by user principal

export interface Investment {
  id: string;
  planId: "mini" | "starter" | "silver" | "gold";
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
  mini: {
    id: "mini" as const,
    name: "Mini",
    amountInvested: 500,
    dailyReturn: 82,
    termDays: 30,
    totalReturn: 2460,
    color: "chart-2",
    description: "Start small, grow big",
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    amountInvested: 1000,
    dailyReturn: 165,
    termDays: 30,
    totalReturn: 4950,
    color: "chart-3",
    description: "Perfect for beginners",
  },
  silver: {
    id: "silver" as const,
    name: "Silver",
    amountInvested: 5000,
    dailyReturn: 825,
    termDays: 30,
    totalReturn: 24750,
    color: "chart-2",
    description: "For serious investors",
  },
  gold: {
    id: "gold" as const,
    name: "Gold",
    amountInvested: 10000,
    dailyReturn: 1650,
    termDays: 30,
    totalReturn: 49500,
    color: "gold",
    description: "Maximum returns",
  },
};

const ADMIN_SAMPLE_DATA_KEY = "__investpro_admin_sample__";
const GLOBAL_WITHDRAWALS_KEY = "__investpro_global_withdrawals__";
const GLOBAL_DEPOSITS_KEY = "__investpro_global_deposits__";
const REFERRAL_MAP_KEY = "__investpro_referral_map__";
const REFERRAL_EARNINGS_KEY = "__investpro_ref_earnings__";

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
  planId: "mini" | "starter" | "silver" | "gold",
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

  const daysSinceStart = Math.floor(
    (now - inv.startDate) / (1000 * 60 * 60 * 24),
  );
  const totalDays = Math.min(daysSinceStart + 1, 30);
  const claimAmount = inv.dailyReturn;

  inv.totalEarned += claimAmount;
  inv.lastClaimDate = now;
  inv.daysCompleted = totalDays;
  if (totalDays >= 30) inv.status = "Expired";

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
): { success: boolean; message: string; requestId?: string } {
  if (!utr.trim()) {
    return {
      success: false,
      message: "Please enter the UTR / transaction reference",
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
    status: "Pending",
  };

  // Save to global list
  const global = getGlobalDeposits();
  global.unshift(request);
  localStorage.setItem(GLOBAL_DEPOSITS_KEY, JSON.stringify(global));

  // Add pending transaction to user's history
  const data = loadUserData(userId);
  data.transactions.unshift({
    id: generateId(),
    type: "Deposit",
    amount,
    description: `Deposit ₹${amount.toLocaleString("en-IN")} — Awaiting approval (UTR: ${utr.trim()})`,
    timestamp: Date.now(),
    status: "Pending",
  });
  saveUserData(userId, data);

  return { success: true, message: "Payment proof submitted!", requestId };
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
  return `${base}?ref=${userId}`;
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

export function creditReferralBonus(
  depositUserId: string,
  depositAmount: number,
): void {
  const map = JSON.parse(
    localStorage.getItem(REFERRAL_MAP_KEY) || "{}",
  ) as Record<string, string>;
  const referrerId = map[depositUserId];
  if (!referrerId) return;
  const bonus = Math.floor(depositAmount * 0.1);
  if (bonus <= 0) return;

  // Credit referrer's wallet
  const referrerData = loadUserData(referrerId);
  referrerData.wallet.balance += bonus;
  referrerData.wallet.totalROIEarned += bonus;
  referrerData.transactions.unshift({
    id: `${Date.now()}_ref`,
    type: "ROI",
    amount: bonus,
    description: "Referral bonus (10%) from friend deposit",
    timestamp: Date.now(),
    status: "Success",
  });
  saveUserData(referrerId, referrerData);

  // Track per-friend earnings
  const earnings = JSON.parse(
    localStorage.getItem(REFERRAL_EARNINGS_KEY) || "{}",
  ) as Record<string, Record<string, number>>;
  if (!earnings[referrerId]) earnings[referrerId] = {};
  earnings[referrerId][depositUserId] =
    (earnings[referrerId][depositUserId] || 0) + bonus;
  localStorage.setItem(REFERRAL_EARNINGS_KEY, JSON.stringify(earnings));
}
