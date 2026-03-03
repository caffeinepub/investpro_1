import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDeposit,
  useSubmitDeposit,
  useUserData,
  useUserProfile,
} from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import { notifyWhatsApp } from "@/lib/whatsappNotify";
import { formatINR, setRoyalPassActive } from "@/store/investmentStore";
import {
  AlertCircle,
  ArrowDownCircle,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  ImagePlus,
  Loader2,
  Mail,
  QrCode,
  Send,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const RAZORPAY_KEY = "rzp_test_SMErEZi6HYvAmP";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const QUICK_AMOUNTS = [1000, 1999, 5000, 10000, 25000];

function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-mono font-medium text-foreground truncate">
          {value}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
        onClick={handleCopy}
        title={`Copy ${label}`}
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function Deposit() {
  const userId = useUserId();
  const { data: userData } = useUserData(userId);
  const { data: userProfile } = useUserProfile();
  const userName =
    (userProfile as { name?: string } | null)?.name ?? userId ?? "User";
  const submitMutation = useSubmitDeposit(userId, userName);

  const depositMutation = useDeposit(userId);

  // Detect royal pass purchase mode from URL
  const urlParams = new URLSearchParams(window.location.search);
  const isRoyalPass = urlParams.get("royal") === "true";

  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-set amount to 1999 when purchasing royal pass
  useEffect(() => {
    if (isRoyalPass) {
      setAmount("1999");
    }
  }, [isRoyalPass]);

  const parsedAmount = Number(amount);
  const isValidAmount = parsedAmount >= 100 && !Number.isNaN(parsedAmount);
  const balance = userData?.wallet.balance ?? 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshotPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmitProof() {
    if (!isValidAmount) {
      toast.error("Please enter a valid amount (minimum ₹100)");
      return;
    }
    if (!utr.trim()) {
      toast.error("Please enter the UTR / Transaction ID");
      return;
    }
    if (!screenshot || !screenshotPreview) {
      toast.error("Please attach a payment screenshot");
      return;
    }

    try {
      const result = await submitMutation.mutateAsync({
        amount: parsedAmount,
        utr: utr.trim(),
        screenshotDataUrl: screenshotPreview,
      });

      const wasAutoApproved = result?.autoApproved ?? false;
      setAutoApproved(wasAutoApproved);
      setDepositedAmount(parsedAmount);

      // Activate Royal Pass if this was a royal pass purchase
      if (isRoyalPass && wasAutoApproved && userId) {
        setRoyalPassActive(userId);
      }

      // Silent background notification to admin — no WhatsApp window opened
      notifyWhatsApp(
        wasAutoApproved
          ? `DEPOSIT AUTO-APPROVED\nUser: ${userName}\nAmount: ₹${parsedAmount}\nUTR: ${utr.trim()}\nWallet credited automatically.`
          : `NEW DEPOSIT REQUEST\nUser: ${userName}\nAmount: ₹${parsedAmount}\nUTR: ${utr.trim()}\nPlease verify and approve.`,
      );

      setSubmitted(true);
      toast.success(
        wasAutoApproved
          ? `₹${parsedAmount.toLocaleString("en-IN")} added to your wallet!`
          : "Payment proof submitted!",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
  }

  function handleRazorpayPayment() {
    if (!isValidAmount) {
      toast.error("Please enter a valid amount (minimum ₹100)");
      return;
    }
    if (!window.Razorpay) {
      toast.error("Razorpay failed to load. Please refresh and try again.");
      return;
    }

    setRazorpayLoading(true);

    const options = {
      key: RAZORPAY_KEY,
      amount: parsedAmount * 100, // paise
      currency: "INR",
      name: "InvestPro",
      description: "Wallet Deposit",
      image: "/assets/generated/investpro-icon-192.dim_192x192.png",
      prefill: {
        name: userName,
      },
      theme: {
        color: "#d4af37",
      },
      handler: async (response: { razorpay_payment_id: string }) => {
        // Payment successful — auto-credit wallet
        try {
          await depositMutation.mutateAsync({
            amount: parsedAmount,
            description: `Razorpay payment ${response.razorpay_payment_id}`,
          });
          setDepositedAmount(parsedAmount);
          setAutoApproved(true);
          setSubmitted(true);
          if (isRoyalPass && userId) {
            setRoyalPassActive(userId);
          }
          notifyWhatsApp(
            `RAZORPAY DEPOSIT\nUser: ${userName}\nAmount: ₹${parsedAmount}\nPayment ID: ${response.razorpay_payment_id}\nWallet credited automatically.`,
          );
          toast.success(
            `₹${parsedAmount.toLocaleString("en-IN")} added to your wallet!`,
          );
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to credit wallet",
          );
        } finally {
          setRazorpayLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setRazorpayLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
      setRazorpayLoading(false);
    });
    rzp.open();
  }

  function handleNewDeposit() {
    setAmount("");
    setUtr("");
    setScreenshot(null);
    setScreenshotPreview("");
    setSubmitted(false);
    setAutoApproved(false);
    setDepositedAmount(0);
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ArrowDownCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Deposit Funds
            </h1>
            <p className="text-muted-foreground text-sm">
              Add money to your InvestPro wallet
            </p>
          </div>
        </div>
      </motion.div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Current Balance
              </p>
              <p className="text-2xl font-display font-bold text-primary">
                {formatINR(balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Submitted state ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            {autoApproved ? (
              /* Auto-approved: wallet credited instantly */
              <Card className="border-chart-2/40 bg-chart-2/5 overflow-hidden">
                <CardContent className="p-6 text-center space-y-4">
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                  >
                    <div className="p-4 bg-chart-2/15 rounded-full ring-4 ring-chart-2/20">
                      <CheckCircle2 className="w-10 h-10 text-chart-2" />
                    </div>
                  </motion.div>
                  <div className="space-y-1">
                    <h2 className="font-display font-bold text-xl text-foreground">
                      Wallet Credited!
                    </h2>
                    <p className="text-2xl font-display font-bold text-chart-2">
                      {formatINR(depositedAmount)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your payment has been verified and{" "}
                    <span className="font-semibold text-chart-2">
                      {formatINR(depositedAmount)}
                    </span>{" "}
                    has been added to your wallet balance instantly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-chart-2/30 hover:bg-chart-2/10 hover:text-chart-2"
                      onClick={handleNewDeposit}
                    >
                      Make Another Deposit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Fallback: pending review */
              <Card className="border-chart-2/30 bg-chart-2/5">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-chart-2/10 rounded-full">
                      <Clock className="w-7 h-7 text-chart-2" />
                    </div>
                  </div>
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Proof Submitted!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your payment proof has been submitted to the admin for
                    verification. Your wallet will be credited once approved.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleNewDeposit}
                  >
                    Make Another Deposit
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && (
        <>
          {/* Royal Pass Notice Banner */}
          {isRoyalPass && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.04 75 / 0.7), oklch(0.08 0.02 285 / 0.9))",
                  border: "1px solid oklch(0.78 0.16 75 / 0.4)",
                  boxShadow: "0 0 20px oklch(0.78 0.16 75 / 0.1)",
                }}
              >
                <Crown
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.85 0.2 78)" }}
                />
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.85 0.2 78)" }}
                  >
                    Purchasing Royal Pass – ₹1,999/month
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Complete the payment below to activate your Royal Pass and
                    unlock all premium features instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Amount selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Choose Amount
                </CardTitle>
                <CardDescription>Minimum deposit: ₹100</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Quick amounts */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Quick Select
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        className={`text-xs border-border/60 hover:border-primary/40 hover:bg-primary/5 ${
                          parsedAmount === amt
                            ? "border-primary bg-primary/10 text-primary"
                            : ""
                        }`}
                        onClick={() => setAmount(String(amt))}
                      >
                        {formatINR(amt)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div>
                  <Label htmlFor="amount" className="text-sm mb-2 block">
                    Custom Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7 bg-input/50 border-border/60 focus:border-primary"
                      min="100"
                    />
                  </div>
                  {amount && !isValidAmount && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Minimum amount is ₹100
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Payment Details Panel (auto-shown) ── */}
          <AnimatePresence>
            {isValidAmount && (
              <motion.div
                key="payment-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-6 space-y-4"
              >
                {/* Section header */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/50" />
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold px-3 gap-1.5"
                  >
                    <QrCode className="w-3 h-3" />
                    Pay {formatINR(parsedAmount)}
                  </Badge>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Transfer{" "}
                  <span className="font-semibold text-primary">
                    {formatINR(parsedAmount)}
                  </span>{" "}
                  using any method below, then enter your UTR and attach a
                  screenshot.
                </p>

                {/* QR Code */}
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      Scan QR to Pay
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4 pb-5">
                    <div className="rounded-xl overflow-hidden border-4 border-primary/20 shadow-lg shadow-primary/10 bg-white p-2">
                      <img
                        src="/assets/uploads/WhatsApp-Image-2026-03-01-at-7.47.34-PM-1.jpeg"
                        alt="Payment QR Code"
                        className="w-52 h-52 object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Open any UPI app and scan this QR code to pay
                    </p>
                  </CardContent>
                </Card>

                {/* UPI ID */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <span className="text-primary font-bold text-lg">₹</span>
                      UPI Transfer
                    </CardTitle>
                    <CardDescription>
                      Pay directly using your UPI app
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/40 rounded-lg px-3 border border-border/50">
                      <CopyField
                        label="UPI ID"
                        value="9813983483-2.wallet@phonepe"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Transfer Details */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Bank Transfer (NEFT / IMPS)
                    </CardTitle>
                    <CardDescription>
                      Transfer directly to our bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/40 rounded-lg px-3 border border-border/50 divide-y divide-border/40">
                      <CopyField
                        label="Account Number"
                        value="7871001700092453"
                      />
                      <CopyField label="IFSC Code" value="PUNB0787100" />
                      <div className="py-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Bank Name
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          Punjab National Bank
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ── Razorpay Instant Pay ── */}
                <Card className="border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Pay Instantly with Razorpay
                    </CardTitle>
                    <CardDescription>
                      UPI, Credit/Debit Card, Net Banking — wallet credited
                      instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full font-bold text-base py-5 gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white border-0 shadow-lg shadow-yellow-500/20"
                      onClick={handleRazorpayPayment}
                      disabled={!isValidAmount || razorpayLoading}
                    >
                      {razorpayLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {razorpayLoading
                        ? "Opening Razorpay..."
                        : `Pay ${formatINR(parsedAmount)} via Razorpay`}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Secured by Razorpay · Instant wallet credit
                    </p>
                  </CardContent>
                </Card>

                {/* Divider between Razorpay and manual */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs text-muted-foreground font-medium px-2">
                    OR PAY MANUALLY
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                {/* ── Payment Proof Section ── */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/50" />
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold px-3 gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    Submit Payment Proof
                  </Badge>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <Card className="border-primary/30 bg-primary/3">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base">
                      After Paying
                    </CardTitle>
                    <CardDescription>
                      Enter your UTR and attach a screenshot — your wallet will
                      be credited instantly upon submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* UTR input */}
                    <div>
                      <Label htmlFor="utr" className="text-sm mb-2 block">
                        UTR / Transaction ID{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="utr"
                        type="text"
                        placeholder="e.g. 407123456789 or UPI ref number"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        className="bg-input/50 border-border/60 focus:border-primary font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Found in your UPI app or bank SMS after payment
                      </p>
                    </div>

                    {/* Screenshot upload */}
                    <div>
                      <Label className="text-sm mb-2 block">
                        Payment Screenshot{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {screenshotPreview ? (
                        <div className="space-y-2">
                          <div className="relative rounded-lg overflow-hidden border border-chart-2/30">
                            <img
                              src={screenshotPreview}
                              alt="Payment screenshot"
                              className="w-full max-h-48 object-contain bg-muted/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setScreenshot(null);
                                setScreenshotPreview("");
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                              className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-chart-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot attached: {screenshot?.name}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          <ImagePlus className="w-8 h-8" />
                          <span className="text-sm font-medium">
                            Click to attach screenshot
                          </span>
                          <span className="text-xs">
                            JPG, PNG, WebP — max 5 MB
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Submit button */}
                    <Button
                      className="w-full gold-gradient text-primary-foreground border-0 font-semibold gap-2"
                      onClick={handleSubmitProof}
                      disabled={
                        !isValidAmount ||
                        !utr.trim() ||
                        !screenshotPreview ||
                        submitMutation.isPending
                      }
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {submitMutation.isPending
                        ? "Submitting..."
                        : `Submit Proof for ${formatINR(parsedAmount)}`}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your wallet is credited instantly — each UTR can only be
                      used once
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info bullets */}
          <motion.div
            className="mt-6 p-4 rounded-lg bg-card border border-border/50 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
              Funds are credited instantly upon UTR verification
            </p>
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
              Each UTR can only be used once — no duplicates allowed
            </p>
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
              Use your balance to invest in any available plan
            </p>
          </motion.div>
        </>
      )}

      {/* ── Customer Support (always visible) ── */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Customer Support
            </CardTitle>
            <CardDescription>Need help? Reach us anytime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Email Support
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  warisbhaimewati@gmail.com
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      "warisbhaimewati@gmail.com",
                    );
                    toast.success("Copied!");
                  } catch {
                    toast.error("Failed to copy");
                  }
                }}
                title="Copy email"
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Our team typically responds within minutes on email.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
