import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useRequestWithdrawal,
  useUserData,
  useUserProfile,
} from "@/hooks/useQueries";
import { notifyWhatsApp } from "@/lib/whatsappNotify";
import { formatINR } from "@/store/investmentStore";
import type { WithdrawalRequest } from "@/store/investmentStore";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpCircle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: WithdrawalRequest["status"] }) {
  const map = {
    Pending: {
      cls: "bg-warning/10 text-warning border-warning/20",
      icon: Clock,
    },
    Approved: {
      cls: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      icon: CheckCircle2,
    },
    Rejected: {
      cls: "bg-destructive/10 text-destructive border-destructive/20",
      icon: XCircle,
    },
  };
  const config = map[status];
  const Icon = config.icon;
  return (
    <Badge className={`${config.cls} border text-xs gap-1 font-medium`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}

export function Withdraw() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();
  const { data: profile } = useUserProfile();
  const { data: userData } = useUserData(userId);
  const withdrawMutation = useRequestWithdrawal(
    userId,
    profile?.name ?? "User",
  );

  const [amount, setAmount] = useState("");

  const balance = userData?.wallet.balance ?? 0;
  const bankLinked = userData?.bankProfile.isLinked ?? false;
  const withdrawals = userData?.withdrawalRequests ?? [];
  const parsedAmount = Number(amount);
  const MAX_WITHDRAW = 11000;
  const effectiveMax = Math.min(Math.floor(balance), MAX_WITHDRAW);
  const isValid =
    parsedAmount >= 100 &&
    parsedAmount <= effectiveMax &&
    !Number.isNaN(parsedAmount);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await withdrawMutation.mutateAsync(parsedAmount);

      // Silent background notification to admin — no WhatsApp window opened
      notifyWhatsApp(
        `NEW WITHDRAWAL REQUEST\nUser: ${profile?.name ?? "User"}\nAmount: ₹${parsedAmount}\nAccount: ${userData?.bankProfile.accountNumber ?? "N/A"}\nIFSC: ${userData?.bankProfile.ifscCode ?? "N/A"}\nHolder: ${userData?.bankProfile.holderName ?? "N/A"}\nPlease process within 24 hours.`,
      );

      toast.success(
        "Withdrawal request submitted! Admin will process within 24 hours.",
      );
      setAmount("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    }
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
          <div className="p-2 bg-chart-5/10 rounded-lg">
            <ArrowUpCircle className="w-5 h-5 text-chart-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Withdraw Funds
            </h1>
            <p className="text-muted-foreground text-sm">
              Transfer funds to your bank account
            </p>
          </div>
        </div>
      </motion.div>

      {/* Balance */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Available Balance
              </p>
              <p className="text-2xl font-display font-bold text-primary">
                {formatINR(balance)}
              </p>
            </div>
            {bankLinked && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Bank Account</p>
                <p className="text-xs font-mono text-foreground">
                  ****{userData?.bankProfile.accountNumber.slice(-4)}
                </p>
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs mt-1">
                  Linked
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank not linked warning */}
      {!bankLinked && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning mb-1">
                  Bank account not linked
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  You need to link your bank account before making withdrawals.
                </p>
                <Link to="/bank-profile">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-warning/40 text-warning hover:bg-warning/10 gap-2 h-8"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Link Bank Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Withdrawal form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className={`border-border/50 ${!bankLinked ? "opacity-60" : ""}`}>
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Request Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm mb-2 block">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 bg-input/50 border-border/60 focus:border-primary"
                    min="100"
                    max={effectiveMax}
                    disabled={!bankLinked}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">Minimum: ₹100</p>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setAmount(String(effectiveMax))}
                    disabled={!bankLinked}
                  >
                    Max: {formatINR(effectiveMax)}
                  </button>
                </div>
                {balance > MAX_WITHDRAW && (
                  <p className="text-xs text-warning mt-1">
                    Maximum single withdrawal is ₹11,000
                  </p>
                )}
              </div>

              {bankLinked && userData?.bankProfile && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-xs space-y-1">
                  <p className="text-muted-foreground">Withdrawing to:</p>
                  <p className="font-medium text-foreground">
                    {userData.bankProfile.holderName}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    {userData.bankProfile.accountNumber.replace(
                      /.(?=.{4})/g,
                      "*",
                    )}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    {userData.bankProfile.ifscCode}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold gap-2"
                disabled={!bankLinked || !isValid || withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                {withdrawMutation.isPending
                  ? "Processing..."
                  : `Request Withdrawal ${isValid ? formatINR(parsedAmount) : ""}`}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Withdrawal requests are processed within 24 hours by admin
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display font-semibold text-lg mb-4 text-foreground">
          Withdrawal Requests
        </h2>

        {withdrawals.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No withdrawal requests yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((req) => (
              <Card key={req.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-base text-foreground">
                        {formatINR(req.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(req.requestedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <Separator className="my-2 bg-border/40" />
                  <p className="text-xs font-mono text-muted-foreground">
                    → {req.bankDetails.accountNumber.replace(/.(?=.{4})/g, "*")}{" "}
                    · {req.bankDetails.ifscCode}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
