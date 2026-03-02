import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  MoreVertical,
  PlusSquare,
  Share2,
  Smartphone,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppProps {
  onContinue: () => void;
}

const INSTALL_SHOWN_KEY = "investpro_install_shown";

export function InstallApp({ onContinue }: InstallAppProps) {
  const [platform, setPlatform] = useState<"android" | "ios">("android");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [step, setStep] = useState<"prompt" | "manual">("prompt");

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setPlatform(isIOS ? "ios" : "android");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setTimeout(() => handleContinue(), 1800);
    });
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      setStep("manual");
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    } else {
      setStep("manual");
    }
    setDeferredPrompt(null);
  };

  const handleContinue = () => {
    localStorage.setItem(INSTALL_SHOWN_KEY, "true");
    onContinue();
  };

  const ANDROID_STEPS = [
    {
      icon: MoreVertical,
      label: "Tap the 3-dot menu ( ⋮ )",
      desc: "Open Chrome browser and tap the menu icon at top-right corner",
    },
    {
      icon: PlusSquare,
      label: 'Select "Add to Home Screen"',
      desc: 'Scroll down in the menu and tap "Add to Home Screen" or "Install App"',
    },
    {
      icon: CheckCircle2,
      label: 'Tap "Add" to confirm',
      desc: "InvestPro icon will appear on your Android home screen instantly",
    },
  ];

  const IOS_STEPS = [
    {
      icon: Share2,
      label: "Tap the Share button ( □↑ )",
      desc: "Open Safari and tap the share icon at the bottom of the screen",
    },
    {
      icon: PlusSquare,
      label: '"Add to Home Screen"',
      desc: 'Scroll down in the share sheet and tap "Add to Home Screen"',
    },
    {
      icon: CheckCircle2,
      label: 'Tap "Add" to confirm',
      desc: "InvestPro will be installed on your iPhone home screen",
    },
  ];

  const steps = platform === "android" ? ANDROID_STEPS : IOS_STEPS;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.2 160 / 0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.2 240 / 0.1) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.72 0.24 155 / 0.5) 0%, transparent 70%)",
                  }}
                />
                <img
                  src="/assets/generated/investpro-logo-transparent.dim_120x120.png"
                  alt="InvestPro"
                  className="relative w-16 h-16 object-contain"
                />
              </div>
              <h1 className="font-display text-4xl font-bold gold-text">
                InvestPro
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-2">
                <Download className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Add to Home Screen
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Install on your phone
              </h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                Add InvestPro to your home screen for instant one-tap access —
                just like a real app.
              </p>
            </motion.div>

            {/* Stars */}
            <motion.div
              className="flex items-center justify-center gap-3 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-1">
                {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                  <Star
                    key={id}
                    className="w-3 h-3 fill-warning text-warning"
                  />
                ))}
                <span className="ml-1 font-medium">4.9</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android &amp; iPhone</span>
              </div>
            </motion.div>
          </div>

          {/* Installed success */}
          <AnimatePresence>
            {installed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-5 border border-success/30 bg-success/10 text-center space-y-2"
              >
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <p className="font-bold text-foreground">
                  App installed successfully!
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecting to the app…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Install CTA */}
          {!installed && step === "prompt" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">
                    Add to Home Screen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Opens like a native Android app
                  </p>
                </div>
              </div>

              <Button
                onClick={handleNativeInstall}
                className="w-full h-13 font-bold text-base border-0 text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
                  boxShadow: "0 4px 24px rgba(16,185,129,0.4)",
                  height: "52px",
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download &amp; Add to Home Screen
              </Button>

              <button
                type="button"
                onClick={() => setStep("manual")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Having trouble? View manual steps →
              </button>
            </motion.div>
          )}

          {/* Manual Steps */}
          {!installed && step === "manual" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              {/* Tab toggle */}
              <div className="flex border-b border-border">
                {(["android", "ios"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${
                      platform === p
                        ? "bg-primary/10 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "android" ? "🤖 Android" : "🍎 iPhone"}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-sm font-semibold text-foreground">
                            {s.label}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => setStep("prompt")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Skip / Continue */}
          {!installed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full h-11 border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-medium"
              >
                Skip for now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can always add to home screen later from your browser menu
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/** Returns true if the install screen should be shown (not yet seen on this device) */
export function shouldShowInstallScreen(): boolean {
  return localStorage.getItem(INSTALL_SHOWN_KEY) !== "true";
}
