import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useReferralStats } from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import {
  formatINR,
  getOrCreateShortCode,
  getReferralLink,
} from "@/store/investmentStore";
import {
  Copy,
  Gift,
  Hash,
  IndianRupee,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function Referrals() {
  const userId = useUserId();
  const { data: friends = [] } = useReferralStats(userId);
  const [copied, setCopied] = useState(false);

  const referralLink = userId ? getReferralLink(userId) : "";
  const shortCode = userId ? getOrCreateShortCode(userId) : "";
  const totalEarned = friends.reduce((sum, f) => sum + f.totalProfit, 0);
  const [codeCopied, setCodeCopied] = useState(false);

  function handleCopy() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCopyCode() {
    if (!shortCode) return;
    navigator.clipboard.writeText(shortCode).then(() => {
      setCodeCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  function handleWhatsAppShare() {
    if (!referralLink) return;
    const msg = encodeURIComponent(
      `🚀 Join InvestPro and start earning daily returns!\n\nI'm investing and making daily profits. Use my referral link to sign up:\n${referralLink}\n\nYou can start with just ₹500 and earn ₹82/day! 💸`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function handleNativeShare() {
    if (!referralLink) return;
    if (navigator.share) {
      navigator
        .share({
          title: "Join InvestPro",
          text: "Invest and earn daily returns! Start with ₹500.",
          url: referralLink,
        })
        .catch(() => {
          // User cancelled or error — silently ignore
        });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="p-3 lg:p-5 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
            <Share2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Referral Program
            </h1>
            <p className="text-muted-foreground text-xs">
              Earn 10% → 7% → 1% across 3 levels of referrals
            </p>
          </div>
        </div>
      </motion.div>

      {/* How it works banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, oklch(0.72 0.2 160), transparent 60%)",
            }}
          />
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-3">
                  3-Level Referral Rewards
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/60 border border-primary/15">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">
                        L1
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        You invite a friend
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        They deposit → you earn
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary flex-shrink-0">
                      10%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/60 border border-chart-3/15">
                    <div className="w-7 h-7 rounded-full bg-chart-3/20 border border-chart-3/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-chart-3">
                        L2
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        Your friend invites someone
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        That person deposits → you earn
                      </p>
                    </div>
                    <span className="text-sm font-bold text-chart-3 flex-shrink-0">
                      7%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/60 border border-chart-5/15">
                    <div className="w-7 h-7 rounded-full bg-chart-5/20 border border-chart-5/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-chart-5">
                        L3
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        Their friend invites someone
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        That person deposits → you earn
                      </p>
                    </div>
                    <span className="text-sm font-bold text-chart-5 flex-shrink-0">
                      1%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardContent className="p-5">
            <Users className="w-4 h-4 text-primary mb-2" />
            <p className="font-display font-bold text-2xl text-foreground">
              {friends.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Friends Invited
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <IndianRupee className="w-4 h-4 text-primary mb-2" />
            <p className="font-display font-bold text-2xl text-foreground">
              {formatINR(totalEarned)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Earned from Referrals
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Card className="border-primary/25 overflow-hidden relative bg-gradient-to-br from-primary/6 via-card to-chart-3/4">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 85% 10%, oklch(0.72 0.2 160 / 0.1) 0%, transparent 55%)",
            }}
          />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {/* Short code display */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-background/60 border border-primary/20 shadow-inner">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                  Your Code
                </p>
                <p className="text-4xl font-mono font-bold text-primary tracking-[0.3em]">
                  {shortCode || "------"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Friends can enter this on their dashboard
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-12 px-4 border-primary/30 text-primary hover:bg-primary/10 gap-2 flex-col text-xs"
                onClick={handleCopyCode}
                disabled={!shortCode}
              >
                <Copy className="w-4 h-4" />
                {codeCopied ? "Copied!" : "Copy Code"}
              </Button>
            </div>

            {/* Divider with label */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                or share link
              </span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Link display */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/60">
              <p className="flex-1 text-xs font-mono text-muted-foreground truncate min-w-0">
                {referralLink || "Log in to get your referral link"}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="flex-shrink-0 h-7 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={handleCopy}
                disabled={!referralLink}
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            {/* Share buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold gap-2 border-0"
                onClick={handleWhatsAppShare}
                disabled={!referralLink}
              >
                <MessageCircle className="w-4 h-4" />
                Share via WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/10 gap-2"
                onClick={handleNativeShare}
                disabled={!referralLink}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Friends list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display font-semibold text-lg mb-4 text-foreground">
          Invited Friends
        </h2>

        {friends.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">No friends yet</p>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Share your referral link above to invite friends and start
                earning 10% bonuses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Friend User ID
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Joined
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Your Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {friends.map((friend, idx) => (
                    <motion.tr
                      key={friend.friendId}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                          {friend.friendId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          {new Date(friend.joinedAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {friend.totalProfit > 0 ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                            +{formatINR(friend.totalProfit)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            ₹0
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>

      <Separator className="my-8 bg-border/40" />

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-xl bg-card border border-border/50"
      >
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          Earn <span className="text-primary font-semibold">10%</span> when your
          direct friend deposits,{" "}
          <span className="text-chart-3 font-semibold">7%</span> when their
          friend deposits, and{" "}
          <span className="text-chart-5 font-semibold">1%</span> from the 3rd
          level. Bonuses are credited instantly to your wallet across all 3
          levels.
        </p>
      </motion.div>
    </div>
  );
}
