/**
 * useUserId — returns the effective user ID for the current session.
 * Supports both Internet Identity (principal string) and mobile OTP sessions.
 */
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { getMobileSession } from "@/utils/mobileAuth";

export function useUserId(): string | undefined {
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();
  const mobileUser = getMobileSession();
  return principalStr || mobileUser || undefined;
}
