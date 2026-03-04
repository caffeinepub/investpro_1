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
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useRegisterUserMeta,
  useSaveProfile,
  useUserData,
  useUserProfile,
} from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import { clearMobileSession } from "@/utils/mobileAuth";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Loader2,
  LogOut,
  Save,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Settings() {
  const { clear } = useInternetIdentity();
  const userId = useUserId();
  const { data: profile, isLoading } = useUserProfile();
  const { data: userData } = useUserData(userId);
  const saveProfileMutation = useSaveProfile();
  const registerMeta = useRegisterUserMeta();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const bankLinked = userData?.bankProfile.isLinked ?? false;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a valid name");
      return;
    }
    try {
      await saveProfileMutation.mutateAsync(name.trim());
      // Also register in user meta for admin view
      if (userId) {
        await registerMeta.mutateAsync({ userId, name: name.trim() });
      }
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="p-3 lg:p-5 max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <SettingsIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage your account preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="font-display text-base">Profile</CardTitle>
            </div>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm mb-2 block">
                  Display Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input/50 border-border/60 focus:border-primary"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              {userId && (
                <div>
                  <Label className="text-sm mb-2 block text-muted-foreground">
                    Principal ID
                  </Label>
                  <p className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md border border-border/40 break-all">
                    {userId}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                size="sm"
                className="gold-gradient text-primary-foreground border-0 font-semibold gap-2"
                disabled={!name.trim() || saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saveProfileMutation.isPending
                  ? "Saving..."
                  : saved
                    ? "Saved!"
                    : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Profile Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-5"
      >
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Bank Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Required for withdrawals
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bankLinked ? (
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs">
                    Linked
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs text-warning border-warning/20 bg-warning/10"
                  >
                    Not Linked
                  </Badge>
                )}
                <Link to="/bank-profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary text-xs h-7"
                  >
                    {bankLinked ? "Update" : "Link Now"} →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="bg-border/40 mb-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                clearMobileSession();
                clear();
                window.location.reload();
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
