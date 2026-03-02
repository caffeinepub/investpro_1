// Utility for mobile OTP authentication
// One number per device: a mobile number is locked to the first device it logs in from.
// Returning users on the same device are auto-logged in without OTP.

const OTP_STORE_KEY = "investpro_otp_store";
const MOBILE_SESSION_KEY = "mobileAuthUser";
const DEVICE_ID_KEY = "investpro_device_id";
const DEVICE_MOBILE_KEY = "investpro_device_mobile"; // mobile locked to this device
const MOBILE_DEVICE_MAP_KEY = "investpro_mobile_device_map"; // mobile -> deviceId (global)

// ── Device fingerprint ────────────────────────────────────────

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    // Generate a random persistent ID for this device/browser
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ── OTP generation / sending ──────────────────────────────────

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sendOTP(mobile: string): string {
  const otp = generateOTP();
  const entry = { otp, expiry: Date.now() + 5 * 60 * 1000 }; // 5 min
  const store = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || "{}");
  store[mobile] = entry;
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  return otp; // Returned for demo display on screen
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
): { success: boolean; message: string } {
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
  if (entry.otp !== userOtp.trim())
    return { success: false, message: "Incorrect OTP. Please try again." };

  // Lock this number to this device
  const myDeviceId = getOrCreateDeviceId();
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem(MOBILE_DEVICE_MAP_KEY) || "{}",
  );
  map[mobile] = myDeviceId;
  localStorage.setItem(MOBILE_DEVICE_MAP_KEY, JSON.stringify(map));

  // Persist the mobile number for this device so future visits auto-login
  localStorage.setItem(DEVICE_MOBILE_KEY, mobile);

  // Mark session as authenticated
  sessionStorage.setItem(MOBILE_SESSION_KEY, mobile);
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
  // First check in-memory session
  const session = sessionStorage.getItem(MOBILE_SESSION_KEY);
  if (session) return session;

  // Try auto-login from device lock
  const autoMobile = getAutoLoginMobile();
  if (autoMobile) {
    // Restore session silently
    sessionStorage.setItem(MOBILE_SESSION_KEY, autoMobile);
    return autoMobile;
  }
  return null;
}

export function clearMobileSession(): void {
  sessionStorage.removeItem(MOBILE_SESSION_KEY);
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
