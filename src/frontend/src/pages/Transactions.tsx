import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserData } from "@/hooks/useQueries";
import { useUserId } from "@/hooks/useUserId";
import { formatINR } from "@/store/investmentStore";
import type { Transaction } from "@/store/investmentStore";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  Filter,
  History,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function TypeIcon({ type }: { type: Transaction["type"] }) {
  if (type === "ROI")
    return <TrendingUp className="w-3.5 h-3.5 text-chart-2" />;
  if (type === "Deposit")
    return <ArrowDownCircle className="w-3.5 h-3.5 text-primary" />;
  return <ArrowUpCircle className="w-3.5 h-3.5 text-chart-5" />;
}

function StatusIcon({ status }: { status: Transaction["status"] }) {
  if (status === "Success")
    return <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />;
  if (status === "Pending")
    return <Clock className="w-3.5 h-3.5 text-warning" />;
  return <XCircle className="w-3.5 h-3.5 text-destructive" />;
}

const TYPE_COLORS: Record<Transaction["type"], string> = {
  ROI: "text-chart-2",
  Deposit: "text-primary",
  Withdrawal: "text-chart-5",
};

const STATUS_COLORS: Record<Transaction["status"], string> = {
  Success: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const IS_CREDIT: Record<Transaction["type"], boolean> = {
  ROI: true,
  Deposit: true,
  Withdrawal: false,
};

export function Transactions() {
  const userId = useUserId();
  const { data: userData } = useUserData(userId);

  const [typeFilter, setTypeFilter] = useState<"all" | Transaction["type"]>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | Transaction["status"]
  >("all");

  const transactions = userData?.transactions ?? [];

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    totalCredits: transactions
      .filter((tx) => IS_CREDIT[tx.type] && tx.status === "Success")
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalDebits: transactions
      .filter((tx) => !IS_CREDIT[tx.type] && tx.status === "Success")
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalCount: transactions.length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Transaction History
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete record of all your financial activities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Credits</p>
            <p className="font-display font-bold text-chart-2 text-lg">
              {formatINR(stats.totalCredits)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-chart-5/5 border-chart-5/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Debits</p>
            <p className="font-display font-bold text-chart-5 text-lg">
              {formatINR(stats.totalDebits)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Count</p>
            <p className="font-display font-bold text-foreground text-lg">
              {stats.totalCount}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex gap-3 mb-5 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="w-[140px] h-8 text-sm border-border/60">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ROI">ROI</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="Withdrawal">Withdrawal</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-[140px] h-8 text-sm border-border/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        {(typeFilter !== "all" || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => {
              setTypeFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filtered.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-12 text-center">
              <History className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">
                No transactions found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {typeFilter !== "all" || statusFilter !== "all"
                  ? "Try clearing the filters"
                  : "Your transaction history will appear here"}
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
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                      Description
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, idx) => {
                    const isCredit = IS_CREDIT[tx.type];
                    return (
                      <motion.tr
                        key={tx.id}
                        className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs text-foreground">
                            {new Date(tx.timestamp).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <TypeIcon type={tx.type} />
                            <span
                              className={`text-xs font-medium ${TYPE_COLORS[tx.type]}`}
                            >
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {tx.description}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-display font-semibold text-sm ${
                              isCredit ? "text-chart-2" : "text-chart-5"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatINR(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Badge
                              className={`${STATUS_COLORS[tx.status]} border text-[10px] gap-1`}
                            >
                              <StatusIcon status={tx.status} />
                              {tx.status}
                            </Badge>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
