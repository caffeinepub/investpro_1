import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  BarChart3,
  Loader2,
  LogIn,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Daily Returns",
    desc: "Earn up to ₹1,650/day on your investments",
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
    title: "Multiple Plans",
    desc: "Starter, Silver & Gold tiers available",
  },
];

export function Login() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

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
              <p className="font-display font-bold text-2xl gold-text">16.5%</p>
              <p className="text-[11px] text-muted-foreground">Daily ROI</p>
            </div>
            <div className="text-center px-4 border-r border-primary/20">
              <p className="font-display font-bold text-2xl text-foreground">
                30
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
          <Card className="border-primary/20 bg-card shadow-gold-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl gold-gradient mb-4">
                  <LogIn className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Welcome Back
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Sign in to access your investment portfolio
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={login}
                  className="w-full gold-gradient text-primary-foreground border-0 font-semibold text-base h-12 shadow-gold hover:opacity-90 transition-opacity"
                  disabled={isLoggingIn || isInitializing}
                >
                  {isLoggingIn || isInitializing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  {isInitializing
                    ? "Initializing..."
                    : isLoggingIn
                      ? "Opening Login..."
                      : "Sign In with Internet Identity"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={login}
                    className="text-primary hover:underline font-medium"
                  >
                    Create one free
                  </button>
                </p>
              </div>

              <div className="space-y-2">
                {[
                  "🔐 Secured by Internet Computer blockchain",
                  "🏦 Bank-grade security for your assets",
                  "⚡ Instant login, no passwords needed",
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
