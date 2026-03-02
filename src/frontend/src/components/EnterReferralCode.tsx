import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  hasReferrer,
  lookupUserByShortCode,
  registerWithReferral,
} from "@/store/investmentStore";
import { Gift, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const DISMISSAL_KEY = "__investpro_ref_code_entered__";

interface EnterReferralCodeProps {
  userId: string;
  onDismiss?: () => void;
}

export function EnterReferralCode({
  userId,
  onDismiss,
}: EnterReferralCodeProps) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  // Derived state — no effects needed
  const upperCode = code.toUpperCase().trim();
  const isComplete = upperCode.length === 6;
  const resolvedUserId = isComplete ? lookupUserByShortCode(upperCode) : null;
  const isValid =
    isComplete && resolvedUserId !== null && resolvedUserId !== userId;
  const isInvalid = isComplete && !resolvedUserId;
  const isSelf = isComplete && resolvedUserId === userId;

  function handleApply() {
    if (!isValid || !resolvedUserId) return;
    registerWithReferral(userId, resolvedUserId);
    setApplied(true);
    toast.success("Referral linked! You're now connected.");
    setTimeout(() => {
      localStorage.setItem(DISMISSAL_KEY + userId, "1");
      onDismiss?.();
    }, 1200);
  }

  function handleSkip() {
    localStorage.setItem(DISMISSAL_KEY + userId, "1");
    onDismiss?.();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/8 via-card to-chart-3/5 shadow-lg">
        {/* Decorative glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 10% 0%, oklch(0.72 0.2 160 / 0.12) 0%, transparent 60%), radial-gradient(ellipse at 90% 100%, oklch(0.65 0.22 280 / 0.08) 0%, transparent 60%)",
          }}
        />

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-3 right-3 z-10 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <CardContent className="relative z-10 p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 shadow-sm">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-base leading-tight">
                Have a Referral Code?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enter your friend's code to link your account
              </p>
            </div>
          </div>

          {/* Code input */}
          <div className="mb-3">
            <input
              type="text"
              value={upperCode}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6),
                )
              }
              placeholder="e.g. XK92PQ"
              maxLength={6}
              spellCheck={false}
              autoComplete="off"
              className={[
                "w-full text-center text-2xl font-mono font-bold tracking-[0.35em] uppercase",
                "h-14 rounded-xl border-2 bg-background/70 outline-none transition-all duration-200",
                "placeholder:text-muted-foreground/30 placeholder:tracking-[0.35em] placeholder:text-xl",
                isValid
                  ? "border-emerald-500/60 text-emerald-400 shadow-[0_0_16px_oklch(0.72_0.2_160/0.2)]"
                  : isInvalid || isSelf
                    ? "border-destructive/60 text-destructive"
                    : upperCode.length > 0
                      ? "border-primary/40 text-foreground"
                      : "border-border/50 text-foreground",
                "focus:border-primary/70 focus:shadow-[0_0_0_3px_oklch(0.72_0.2_160/0.15)]",
              ].join(" ")}
            />
          </div>

          {/* Real-time feedback */}
          <AnimatePresence mode="wait">
            {/* Success: valid code found */}
            {isValid && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 overflow-hidden"
              >
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-3.5">
                  <p className="text-xs font-semibold text-emerald-400 mb-2.5">
                    ✓ Code accepted!{" "}
                    <span className="font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300">
                      {upperCode}
                    </span>{" "}
                    is your referral code
                  </p>
                  {/* L1/L2/L3 chain */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                        L1
                      </span>
                      <span className="text-[11px] font-bold text-primary">
                        10%
                      </span>
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        Your referrer earns
                      </span>
                    </div>
                    <div className="text-muted-foreground/40 text-xs">→</div>
                    <div className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-chart-3/10 border border-chart-3/20">
                      <span className="text-[10px] font-bold text-chart-3 bg-chart-3/15 px-1.5 py-0.5 rounded-full">
                        L2
                      </span>
                      <span className="text-[11px] font-bold text-chart-3">
                        7%
                      </span>
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        Their referrer earns
                      </span>
                    </div>
                    <div className="text-muted-foreground/40 text-xs">→</div>
                    <div className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-chart-5/10 border border-chart-5/20">
                      <span className="text-[10px] font-bold text-chart-5 bg-chart-5/15 px-1.5 py-0.5 rounded-full">
                        L3
                      </span>
                      <span className="text-[11px] font-bold text-chart-5">
                        1%
                      </span>
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        Their referrer earns
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error: invalid code */}
            {(isInvalid || isSelf) && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 overflow-hidden"
              >
                <p className="text-xs text-destructive font-medium px-1">
                  {isSelf
                    ? "You cannot use your own referral code."
                    : "Invalid code. Please check and try again."}
                </p>
              </motion.div>
            )}

            {/* Typing hint */}
            {!isComplete && upperCode.length > 0 && upperCode.length < 6 && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mb-4"
              >
                <p className="text-xs text-muted-foreground/60 text-center">
                  Keep typing… ({upperCode.length}/6)
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleApply}
              disabled={!isValid || applied}
              className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-0 h-10"
            >
              {applied ? "✓ Code Applied!" : "Apply Code"}
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Returns true if the referral code card should be shown for this user */
export function shouldShowReferralCard(userId: string): boolean {
  if (!userId) return false;
  if (localStorage.getItem(DISMISSAL_KEY + userId)) return false;
  if (hasReferrer(userId)) return false;
  return true;
}
