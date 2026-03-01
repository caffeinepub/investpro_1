import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRole } from "../backend.d";
import {
  type BankProfile,
  type PlanId,
  approveDeposit,
  approveWithdrawal,
  claimROI,
  createInvestment,
  depositToWallet,
  getAllUsersData,
  getGlobalDeposits,
  getGlobalWithdrawals,
  getReferralStats,
  loadUserData,
  registerUserMeta,
  rejectDeposit,
  rejectWithdrawal,
  requestWithdrawal,
  saveBankProfile,
  submitDepositRequest,
} from "../store/investmentStore";
import {
  type BroadcastNotice,
  type PlanOverride,
  type PlatformSettings,
  addBroadcastNotice,
  deleteBroadcastNotice,
  getBroadcastNotices,
  getPlanOverrides,
  getPlatformSettings,
  savePlanOverride,
  savePlatformSettings,
} from "../store/platformStore";
import { useActor } from "./useActor";

// ── Auth / Profile ────────────────────────────────────────────

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ── Investment Data ───────────────────────────────────────────

export function useUserData(userId: string | undefined) {
  return useQuery({
    queryKey: ["userData", userId],
    queryFn: () => {
      if (!userId) return null;
      return loadUserData(userId);
    },
    enabled: !!userId,
    refetchInterval: 30_000, // refresh every 30s for countdown timers
  });
}

export function useDeposit(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      description,
    }: { amount: number; description?: string }) => {
      if (!userId) throw new Error("Not authenticated");
      return depositToWallet(userId, amount, description);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
    },
  });
}

export function useCreateInvestment(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("Not authenticated");
      const result = createInvestment(userId, planId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
    },
  });
}

export function useClaimROI(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (investmentId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const result = claimROI(userId, investmentId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
    },
  });
}

export function useRequestWithdrawal(
  userId: string | undefined,
  userName: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!userId) throw new Error("Not authenticated");
      const result = requestWithdrawal(userId, userName, amount);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
      void qc.invalidateQueries({ queryKey: ["globalWithdrawals"] });
    },
  });
}

export function useSaveBankProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bank: Omit<BankProfile, "isLinked">) => {
      if (!userId) throw new Error("Not authenticated");
      return saveBankProfile(userId, bank);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────

export function useGlobalWithdrawals() {
  return useQuery({
    queryKey: ["globalWithdrawals"],
    queryFn: getGlobalWithdrawals,
    refetchInterval: 10_000,
  });
}

export function useAllUsersData() {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsersData,
    refetchInterval: 15_000,
  });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      approveWithdrawal(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["globalWithdrawals"] });
      void qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      rejectWithdrawal(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["globalWithdrawals"] });
      void qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRegisterUserMeta() {
  return useMutation({
    mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
      registerUserMeta(userId, name);
    },
  });
}

// ── Deposit requests ──────────────────────────────────────────

export function useSubmitDeposit(userId: string | undefined, userName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      utr,
      screenshotDataUrl,
    }: { amount: number; utr: string; screenshotDataUrl: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const result = submitDepositRequest(
        userId,
        userName,
        amount,
        utr,
        screenshotDataUrl,
      );
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userData", userId] });
      void qc.invalidateQueries({ queryKey: ["globalDeposits"] });
    },
  });
}

export function useGlobalDeposits() {
  return useQuery({
    queryKey: ["globalDeposits"],
    queryFn: getGlobalDeposits,
    refetchInterval: 10_000,
  });
}

export function useApproveDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      approveDeposit(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["globalDeposits"] });
      void qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRejectDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      rejectDeposit(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["globalDeposits"] });
    },
  });
}

// ── Referrals ─────────────────────────────────────────────────

export function useReferralStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["referralStats", userId],
    queryFn: () => {
      if (!userId) return [];
      return getReferralStats(userId);
    },
    enabled: !!userId,
    refetchInterval: 15_000,
  });
}

// ── Stripe ────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Platform Settings ──────────────────────────────────────────

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platformSettings"],
    queryFn: getPlatformSettings,
    staleTime: 5000,
  });
}

export function useSavePlatformSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: PlatformSettings) => {
      savePlatformSettings(settings);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platformSettings"] });
    },
  });
}

export function useBroadcastNotices() {
  return useQuery({
    queryKey: ["broadcastNotices"],
    queryFn: getBroadcastNotices,
    refetchInterval: 15_000,
  });
}

export function useAddNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notice: Omit<BroadcastNotice, "id" | "createdAt">) => {
      return addBroadcastNotice(notice);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["broadcastNotices"] });
    },
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      deleteBroadcastNotice(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["broadcastNotices"] });
    },
  });
}

export function usePlanOverrides() {
  return useQuery({
    queryKey: ["planOverrides"],
    queryFn: getPlanOverrides,
    staleTime: 5000,
  });
}

export function useSavePlanOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (override: PlanOverride) => {
      savePlanOverride(override);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["planOverrides"] });
    },
  });
}

// Re-export types for convenience
export type { BroadcastNotice, PlanOverride, PlatformSettings };
