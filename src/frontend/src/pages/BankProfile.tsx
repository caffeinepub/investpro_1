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
import { useSaveBankProfile, useUserData } from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function BankProfile() {
  const userId = useUserId();
  const { data: userData } = useUserData(userId);
  const saveMutation = useSaveBankProfile(userId);

  const existing = userData?.bankProfile;

  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  useEffect(() => {
    if (existing?.isLinked) {
      setAccountNumber(existing.accountNumber);
      setHolderName(existing.holderName);
      setIfscCode(existing.ifscCode);
    }
  }, [existing]);

  const isLinked = existing?.isLinked ?? false;
  const isValid =
    accountNumber.length >= 9 &&
    holderName.trim().length >= 2 &&
    ifscCode.length === 11;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please fill all fields correctly");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        accountNumber: accountNumber.trim(),
        holderName: holderName.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
      toast.success("Bank account linked successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save bank profile",
      );
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Bank Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Link your bank account for withdrawals
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status badge */}
      {isLinked && (
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-2 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <CheckCircle2 className="w-4 h-4 text-chart-2 flex-shrink-0" />
            <p className="text-sm text-chart-2 font-medium">
              Bank account linked
            </p>
            <Badge className="ml-auto bg-chart-2/20 text-chart-2 border-chart-2/30 text-xs">
              Verified
            </Badge>
          </div>
        </motion.div>
      )}

      {!isLinked && (
        <motion.div
          className="mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning">
              You need to link a bank account before you can make withdrawals.
            </p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Account Details
            </CardTitle>
            <CardDescription>
              Enter your bank account information for withdrawal processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <Label htmlFor="holderName" className="text-sm mb-2 block">
                  Account Holder Name{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="holderName"
                  type="text"
                  placeholder="As per bank records"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="bg-input/50 border-border/60 focus:border-primary"
                  autoComplete="name"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber" className="text-sm mb-2 block">
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/\D/g, ""))
                  }
                  className="bg-input/50 border-border/60 focus:border-primary font-mono tracking-wider"
                  autoComplete="off"
                  maxLength={18}
                />
                {accountNumber && accountNumber.length < 9 && (
                  <p className="text-xs text-destructive mt-1">
                    Minimum 9 digits required
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ifscCode" className="text-sm mb-2 block">
                  IFSC Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="bg-input/50 border-border/60 focus:border-primary font-mono tracking-wider uppercase"
                  autoComplete="off"
                  maxLength={11}
                />
                {ifscCode && ifscCode.length !== 11 && (
                  <p className="text-xs text-destructive mt-1">
                    IFSC code must be exactly 11 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gold-gradient text-primary-foreground border-0 font-semibold"
                disabled={!isValid || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {saveMutation.isPending
                  ? "Saving..."
                  : isLinked
                    ? "Update Bank Account"
                    : "Link Bank Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security note */}
      <motion.div
        className="mt-5 p-4 rounded-lg bg-card border border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground mb-1">
              Your data is secure
            </p>
            <p className="text-xs text-muted-foreground">
              Bank details are encrypted and used only for processing withdrawal
              requests. We never share your information with third parties.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
