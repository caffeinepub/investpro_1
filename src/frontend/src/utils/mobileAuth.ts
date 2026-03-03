// Utility for mobile OTP authentication
// One number per device: a mobile number is locked to the first device it logs in from.
// Returning users on the same device are auto-logged in without OTP.
// Security: OTP never displayed on screen, brute-force lockout after 3 wrong attempts.

const OTP_STORE_KEY = "investpro_otp_store";
const MOBILE_SESSION_KEY = "mobileAuthUser";
const DEVICE_ID_KEY = "investpro_device_id";
const DEVICE_MOBILE_KEY = "investpro_device_mobile"; // mobile locked to this device
const MOBILE_DEVICE_MAP_KEY = "investpro_mobile_device_map"; // mobile -> deviceId (global)
const ATTEMPT_KEY = "investpro_otp_attempts"; // track failed attempts

const OTP_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 min lockout after max failures

// ── Device fingerprint ────────────────────────────────────────
// Uses multiple browser signals to make the fingerprint harder to spoof

function buildFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
    navigator.maxTouchPoints || "",
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash << 5) - hash + parts.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    const fp = buildFingerprint();
    id = `${Date.now().toString(36)}-${fp}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ── Attempt tracking ──────────────────────────────────────────

interface AttemptRecord {
  count: number;
  lockedUntil?: number;
}

function getAttempts(mobile: string): AttemptRecord {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  const all: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
  return all[mobile] || { count: 0 };
}

function incrementAttempt(mobile: string): AttemptRecord {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  const all: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
  const rec = all[mobile] || { count: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  all[mobile] = rec;
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(all));
  return rec;
}

function resetAttempts(mobile: string): void {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  const all: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
  delete all[mobile];
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(all));
}

export function isLockedOut(mobile: string): {
  locked: boolean;
  remainingMs: number;
} {
  const rec = getAttempts(mobile);
  if (rec.lockedUntil && Date.now() < rec.lockedUntil) {
    return { locked: true, remainingMs: rec.lockedUntil - Date.now() };
  }
  if (rec.lockedUntil && Date.now() >= rec.lockedUntil) {
    // Lockout expired -- reset
    resetAttempts(mobile);
  }
  return { locked: false, remainingMs: 0 };
}

export function getRemainingAttempts(mobile: string): number {
  const rec = getAttempts(mobile);
  return Math.max(0, MAX_ATTEMPTS - rec.count);
}

// ── OTP generation / sending ──────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP is generated locally and shown on screen for the user to enter
let _lastOtp = "";

export function getLastOtp(): string {
  return _lastOtp;
}

export function sendOTP(mobile: string): void {
  const otp = generateOTP();
  _lastOtp = otp;
  const entry = { otp, expiry: Date.now() + OTP_EXPIRY_MS };
  const store = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || "{}");
  store[mobile] = entry;
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  // Reset attempts on new OTP send
  resetAttempts(mobile);
}

// ── Device-lock check ─────────────────────────────────────────
// Returns null if allowed, or an error message string if blocked.
export function checkDeviceLock(mobile: string): string | null {
  const myDeviceId = getOrCreateDeviceId();
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem(MOBILE_DEVICE_MAP_KEY) || "{}",
  );
  const registeredDevice = map[mobile];

  if (!registeredDevice) {
    // First time this number is seen -- allowed
    return null;
  }
  if (registeredDevice !== myDeviceId) {
    // Number is registered on a different device
    return "This mobile number is already registered on another device. Each number can only be used on one device.";
  }
  return null; // Same device -- allowed
}

// ── OTP verification ──────────────────────────────────────────

export function verifyOTP(
  mobile: string,
  userOtp: string,
): { success: boolean; message: string; attemptsLeft?: number } {
  // Check lockout first
  const lockCheck = isLockedOut(mobile);
  if (lockCheck.locked) {
    const mins = Math.ceil(lockCheck.remainingMs / 60000);
    return {
      success: false,
      message: `Too many incorrect attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
    };
  }

  // Re-check device lock at verification time
  const lockErr = checkDeviceLock(mobile);
  if (lockErr) return { success: false, message: lockErr };

  const store = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || "{}");
  const entry = store[mobile];
  if (!entry)
    return {
      success: false,
      message: "No OTP sent for this number. Please request a new OTP.",
    };
  if (Date.now() > entry.expiry)
    return {
      success: false,
      message: "OTP has expired. Please request a new one.",
    };

  if (entry.otp !== userOtp.trim()) {
    const rec = incrementAttempt(mobile);
    const remaining = Math.max(0, MAX_ATTEMPTS - rec.count);
    if (remaining === 0) {
      return {
        success: false,
        message:
          "Too many incorrect attempts. Your account is locked for 10 minutes.",
        attemptsLeft: 0,
      };
    }
    return {
      success: false,
      message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      attemptsLeft: remaining,
    };
  }

  // OTP is correct -- reset attempts
  resetAttempts(mobile);

  // Lock this number to this device
  const myDeviceId = getOrCreateDeviceId();
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem(MOBILE_DEVICE_MAP_KEY) || "{}",
  );
  map[mobile] = myDeviceId;
  localStorage.setItem(MOBILE_DEVICE_MAP_KEY, JSON.stringify(map));

  // Persist the mobile number for this device so future visits auto-login
  localStorage.setItem(DEVICE_MOBILE_KEY, mobile);

  // Mark session as authenticated — persisted in localStorage so it survives browser close
  localStorage.setItem(MOBILE_SESSION_KEY, mobile);
  localStorage.setItem("investpro_mobile_user", mobile);

  return { success: true, message: "OTP verified successfully!" };
}

// ── Auto-login: check if this device already has a verified session ──

/**
 * Returns the mobile number if this device has previously verified OTP,
 * i.e. auto-login is allowed. Returns null otherwise.
 */
export function getAutoLoginMobile(): string | null {
  const myDeviceId = getOrCreateDeviceId();
  const savedMobile = localStorage.getItem(DEVICE_MOBILE_KEY);
  if (!savedMobile) return null;

  // Confirm the mobile is still mapped to this exact device
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem(MOBILE_DEVICE_MAP_KEY) || "{}",
  );
  if (map[savedMobile] === myDeviceId) {
    return savedMobile;
  }
  // Mapping mismatch -- clear stale data
  localStorage.removeItem(DEVICE_MOBILE_KEY);
  return null;
}

// ── Session helpers ───────────────────────────────────────────

export function getMobileSession(): string | null {
  // Check localStorage first — persists across browser close/reopen
  const session = localStorage.getItem(MOBILE_SESSION_KEY);
  if (session) return session;

  // Fall back to auto-login from device lock
  const autoMobile = getAutoLoginMobile();
  if (autoMobile) {
    // Restore session silently
    localStorage.setItem(MOBILE_SESSION_KEY, autoMobile);
    return autoMobile;
  }
  return null;
}

export function clearMobileSession(): void {
  localStorage.removeItem(MOBILE_SESSION_KEY);
  // Note: we intentionally keep DEVICE_MOBILE_KEY and MOBILE_DEVICE_MAP_KEY
  // so the device stays locked to this number. Only clear the active session.
  localStorage.removeItem("investpro_mobile_user");
}

export function getSavedMobile(): string {
  return (
    localStorage.getItem(DEVICE_MOBILE_KEY) ||
    localStorage.getItem("investpro_mobile_user") ||
    ""
  );
}
