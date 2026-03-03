import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  checkDeviceLock,
  getAutoLoginMobile,
  getLastOtp,
  getSavedMobile,
  isLockedOut,
  sendOTP,
  verifyOTP,
} from "@/utils/mobileAuth";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Phone,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Daily Returns",
    desc: "Earn up to ₹1,65,000/day on your investments",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    desc: "Blockchain-backed security for your funds",
  },
  {
    icon: Zap,
    title: "Instant Claims",
    desc: "Claim daily ROI directly to your wallet",
  },
  {
    icon: BarChart3,
    title: "9 Premium Plans",
    desc: "Mini to Royal — invest your way",
  },
];

const RESEND_TIMEOUT = 30;

export function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState(() => {
    const saved = getSavedMobile();
    // Strip leading +91 if present
    return saved.startsWith("+91") ? saved.slice(3) : saved;
  });
  const [mobileError, setMobileError] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [shownOtp, setShownOtp] = useState("");

  // Auto-login: if this device already verified, redirect straight to dashboard
  useEffect(() => {
    const autoMobile = getAutoLoginMobile();
    if (autoMobile) {
      setAutoLoggingIn(true);
      // Brief animation, then redirect — session is already in localStorage
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 900);
    }
  }, []);

  // Refs for the 6 OTP boxes
  const digitRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  // Countdown timer for resend
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, resendTimer]);

  // Lockout countdown
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const id = setInterval(() => {
      setLockoutRemaining((t) => {
        if (t <= 1000) {
          clearInterval(id);
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutRemaining]);

  const handleSendOTP = useCallback(() => {
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }
    // Check lockout
    const lockCheck = isLockedOut(cleaned);
    if (lockCheck.locked) {
      const mins = Math.ceil(lockCheck.remainingMs / 60000);
      setMobileError(
        `Account locked. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
      );
      setLockoutRemaining(lockCheck.remainingMs);
      return;
    }
    // Check if this number is locked to another device
    const lockErr = checkDeviceLock(cleaned);
    if (lockErr) {
      setMobileError(lockErr);
      return;
    }
    setMobileError("");
    setIsSending(true);
    setTimeout(() => {
      sendOTP(cleaned);
      setShownOtp(getLastOtp());
      setOtpDigits(Array(6).fill(""));
      setError("");
      setAttemptsLeft(null);
      setResendTimer(RESEND_TIMEOUT);
      setStep(2);
      setIsSending(false);
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    }, 400);
  }, [mobile]);

  const handleResend = useCallback(() => {
    const cleaned = mobile.replace(/\D/g, "");
    sendOTP(cleaned);
    setShownOtp(getLastOtp());
    setOtpDigits(Array(6).fill(""));
    setError("");
    setAttemptsLeft(null);
    setResendTimer(RESEND_TIMEOUT);
    setTimeout(() => digitRefs.current[0]?.focus(), 50);
  }, [mobile]);

  const handleDigitChange = (idx: number, value: string) => {
    // Allow only single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    setError("");

    // Auto-advance to next box
    if (digit && idx < 5) {
      digitRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") {
      const allFilled = otpDigits.every((d) => d !== "");
      if (allFilled) handleVerify();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      const next = Array(6).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setOtpDigits(next);
      const focusIdx = Math.min(pasted.length, 5);
      digitRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = useCallback(() => {
    const otp = otpDigits.join("");
    if (otp.length < 6) return;
    const cleaned = mobile.replace(/\D/g, "");
    setIsVerifying(true);
    setError("");

    setTimeout(() => {
      const result = verifyOTP(cleaned, otp);
      if (result.success) {
        window.location.replace("/dashboard");
      } else {
        setError(result.message);
        setIsVerifying(false);
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
        }
        if (result.attemptsLeft === 0) {
          const lock = isLockedOut(cleaned);
          if (lock.locked) setLockoutRemaining(lock.remainingMs);
        }
        setOtpDigits(Array(6).fill(""));
        setTimeout(() => digitRefs.current[0]?.focus(), 50);
      }
    }, 500);
  }, [otpDigits, mobile]);

  const allDigitsFilled = otpDigits.every((d) => d !== "");

  // Auto-login splash
  if (autoLoggingIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <img
            src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
            alt="InvestPro"
            className="w-16 h-16 object-contain animate-pulse-gold"
          />
          <div className="flex items-center gap-2 text-chart-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-base font-semibold">Device recognised</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Logging you in automatically...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-primary mt-1" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-chart-3/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, oklch(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Brand */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
              alt="InvestPro"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-display text-3xl font-bold gold-text">
                InvestPro
              </h1>
              <p className="text-xs text-muted-foreground">
                Premium Investment Platform
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-4xl font-bold text-foreground leading-tight">
              Grow Your Wealth with{" "}
              <span className="gold-text">Daily Returns</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Invest in tiered plans and earn guaranteed daily ROI. Your
              financial growth, automated and transparent.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08 }}
                  className="flex gap-3 p-3 rounded-lg bg-card border border-border/50"
                >
                  <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0 h-fit mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {f.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ROI highlight */}
          <motion.div
            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center px-4 border-r border-primary/20">
              <p className="font-display font-bold text-2xl gold-text">33%</p>
              <p className="text-[11px] text-muted-foreground">Daily ROI</p>
            </div>
            <div className="text-center px-4 border-r border-primary/20">
              <p className="font-display font-bold text-2xl text-foreground">
                15
              </p>
              <p className="text-[11px] text-muted-foreground">Day Terms</p>
            </div>
            <div className="text-center px-4">
              <p className="font-display font-bold text-2xl text-chart-2">
                495%
              </p>
              <p className="text-[11px] text-muted-foreground">Total Return</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Login card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-card shadow-gold-lg overflow-hidden">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 space-y-6"
                  >
                    {/* Header */}
                    <div className="text-center">
                      <div className="inline-flex p-3 rounded-xl gold-gradient mb-4">
                        <Phone className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        Enter Mobile Number
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        We'll send you a one-time password
                      </p>
                    </div>

                    {/* Mobile input */}
                    <div className="space-y-2">
                      <label
                        htmlFor="mobile-input"
                        className="text-sm font-medium text-foreground"
                      >
                        Mobile Number
                      </label>
                      <div className="flex gap-0 rounded-lg border-2 border-border bg-input focus-within:border-primary transition-colors overflow-hidden">
                        <div className="flex items-center px-3 bg-muted/50 border-r border-border">
                          <span className="text-sm font-semibold text-foreground">
                            +91
                          </span>
                        </div>
                        <input
                          id="mobile-input"
                          type="tel"
                          inputMode="numeric"
                          placeholder="Enter 10-digit number"
                          value={mobile}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setMobile(val);
                            setMobileError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendOTP();
                          }}
                          className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                          autoComplete="tel"
                        />
                      </div>
                      {mobileError && (
                        <p className="text-xs text-destructive font-medium">
                          {mobileError}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleSendOTP}
                      disabled={isSending || mobile.length !== 10}
                      className="w-full gold-gradient text-primary-foreground border-0 font-semibold text-base h-12 shadow-gold hover:opacity-90 transition-opacity"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Send OTP
                        </>
                      )}
                    </Button>

                    <div className="space-y-2">
                      {[
                        "🔐 One number locked to one device only",
                        "🛡️ Brute-force protection with auto-lockout",
                        "⚡ Returning device auto-login, no OTP needed",
                      ].map((item) => (
                        <p
                          key={item}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-base leading-none">
                            {item.slice(0, 2)}
                          </span>
                          <span>{item.slice(3)}</span>
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 space-y-6"
                  >
                    {/* Header */}
                    <div className="text-center">
                      <div className="inline-flex p-3 rounded-xl gold-gradient mb-4">
                        <Shield className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        Enter OTP
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Enter the 6-digit code sent to{" "}
                        <span className="text-foreground font-medium">
                          +91 {mobile}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtpDigits(Array(6).fill(""));
                          setError("");
                        }}
                        className="text-xs text-primary hover:underline mt-1 font-medium"
                      >
                        Change number
                      </button>
                    </div>

                    {/* OTP display box */}
                    {shownOtp && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                      >
                        <p className="text-sm text-blue-300 font-medium">
                          Your OTP:
                        </p>
                        <p className="text-xl font-bold tracking-[0.3em] text-blue-200">
                          {shownOtp}
                        </p>
                      </motion.div>
                    )}

                    {/* Lockout warning */}
                    {lockoutRemaining > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                      >
                        <Lock className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-destructive font-semibold">
                            Account Locked
                          </p>
                          <p className="text-destructive/80 text-xs mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Unlocks in {Math.ceil(lockoutRemaining / 60000)} min{" "}
                            {Math.floor((lockoutRemaining % 60000) / 1000)}s
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {/* Attempts warning */}
                    {attemptsLeft !== null &&
                      attemptsLeft > 0 &&
                      lockoutRemaining === 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-yellow-300 font-medium">
                              Warning
                            </p>
                            <p className="text-yellow-200/80 text-xs mt-0.5">
                              {attemptsLeft} attempt
                              {attemptsLeft !== 1 ? "s" : ""} remaining before
                              10-minute lockout
                            </p>
                          </div>
                        </motion.div>
                      )}

                    {/* 6-digit OTP boxes */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        One-Time Password
                      </p>
                      <fieldset
                        className="flex gap-2 justify-center border-0 p-0 m-0"
                        aria-label="Enter 6-digit OTP"
                      >
                        {(["d0", "d1", "d2", "d3", "d4", "d5"] as const).map(
                          (key, idx) => (
                            <input
                              key={key}
                              ref={(el) => {
                                digitRefs.current[idx] = el;
                              }}
                              type="tel"
                              inputMode="numeric"
                              maxLength={1}
                              value={otpDigits[idx]}
                              onChange={(e) =>
                                handleDigitChange(idx, e.target.value)
                              }
                              onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleDigitPaste : undefined}
                              className={`w-11 h-14 text-center text-xl font-bold rounded-lg outline-none transition-all border-2
                              ${otpDigits[idx] ? "border-primary bg-primary/10 text-foreground" : "border-border bg-input text-foreground"}
                              focus:border-primary focus:ring-2 focus:ring-primary/20
                              ${error ? "border-destructive" : ""}
                            `}
                              aria-label={`OTP digit ${idx + 1}`}
                            />
                          ),
                        )}
                      </fieldset>
                      {error && (
                        <p className="text-xs text-destructive font-medium text-center">
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Verify button */}
                    <Button
                      onClick={handleVerify}
                      disabled={
                        !allDigitsFilled || isVerifying || lockoutRemaining > 0
                      }
                      className="w-full gold-gradient text-primary-foreground border-0 font-semibold text-base h-12 shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify &amp; Login
                        </>
                      )}
                    </Button>

                    {/* Resend */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Resend OTP in{" "}
                          <span className="text-primary font-semibold">
                            {resendTimer}s
                          </span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
