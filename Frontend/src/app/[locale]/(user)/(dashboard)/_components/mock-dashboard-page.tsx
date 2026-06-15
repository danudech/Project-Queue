"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export type MockStat = {
  label: string;
  value: string;
  helper: string;
  color?: "primary" | "success" | "warning" | "info" | "secondary";
};

export type MockRow = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  amount?: string;
  enabled?: boolean;
};

export type MockDashboardPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
  stats: MockStat[];
  rows: MockRow[];
  panelTitle: string;
  panelDescription: string;
  progressLabel?: string;
  progressValue?: number;
  detailItems?: Array<{ label: string; value: string }>;
};

const statusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("paid") || normalized.includes("done")) return "success";
  if (normalized.includes("pending") || normalized.includes("waiting")) return "warning";
  if (normalized.includes("failed") || normalized.includes("closed")) return "destructive";
  return "secondary";
};

export default function MockDashboardPage({
  eyebrow,
  title,
  description,
  primaryAction = "Add new",
  secondaryAction = "Refresh",
  stats,
  rows,
  panelTitle,
  panelDescription,
  progressLabel = "Mock completion",
  progressValue = 68,
  detailItems = [],
}: MockDashboardPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return localRows;
    return localRows.filter((row) =>
      [row.title, row.subtitle, row.meta, row.status].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [localRows, query]);

  const refreshMock = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const toggleRow = (id: string, checked: boolean) => {
    setLocalRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, enabled: checked } : row))
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Loading mock data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold text-default-900">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshMock} disabled={isRefreshing} className="gap-2">
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {secondaryAction}
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {primaryAction}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-default-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.helper}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">{panelTitle}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{panelDescription}</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search mock data..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" aria-label="Filter">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredRows.map((row) => (
              <div
                key={row.id}
                className="grid gap-3 rounded-md border border-default-200 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-default-900">{row.title}</p>
                    <Badge color={statusColor(row.status) as any}>{row.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{row.subtitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{row.meta}</p>
                </div>
                {row.amount && <p className="text-sm font-semibold text-default-900">{row.amount}</p>}
                {typeof row.enabled === "boolean" ? (
                  <Switch checked={row.enabled} onCheckedChange={(checked) => toggleRow(row.id, checked)} />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
            ))}

            {filteredRows.length === 0 && (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No mock data found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4" />
              Quick summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progressLabel}</span>
                <span className="font-medium">{progressValue}%</span>
              </div>
              <Progress value={progressValue} />
            </div>

            <div className="space-y-3">
              {detailItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-default-900">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              This page is wired with local mock state only. Replace the mock rows with API queries when the backend endpoint is ready.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
