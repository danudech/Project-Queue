"use client";

import { useState } from "react";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/config/brand";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADMIN_MOCK_EMAIL,
  ADMIN_MOCK_PASSWORD,
  ADMIN_MOCK_PERMISSIONS,
} from "@/config/admin-mock";

export function AdminMockLogin({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_MOCK_EMAIL);
  const [password, setPassword] = useState(ADMIN_MOCK_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const copy = async (value: string, field: "email" | "password") => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to start mock session");
      }
      router.replace(`/${locale}/admin`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start mock session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ez-auth min-h-screen w-full bg-default-50 text-default-900 font-sans">
        <div className="grid min-h-screen w-full lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Visual Editorial Hero */}
          <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#102e25] p-10 lg:flex xl:p-14 text-white">
            <Image
              src="/images/editorial/studio.webp"
              alt="EZQueue Studio"
              fill
              priority
              className="object-cover object-center opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e18] via-[#0f2e24]/70 to-[#0a1e18]/40" />

            {/* Top Brand Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <BrandLogo compact onDark symbolClassName="size-10" />
                <div>
                  <strong className="block text-lg font-bold tracking-tight text-white">
                    {BRAND.name}
                  </strong>
                  <span className="text-[11px] font-semibold tracking-wider text-emerald-200/70 uppercase">
                    Platform Control
                  </span>
                </div>
              </Link>
              <Badge
                color="primary"
                className="border border-emerald-400/30 bg-emerald-900/60 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md"
              >
                Mock Sandbox
              </Badge>
            </div>

            {/* Hero Copy */}
            <div className="relative z-10 my-auto py-12 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1bd76]">
                PLATFORM ADMINISTRATION
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                Inspect cross-tenant operations with confidence.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-lg">
                This environment simulates platform-level supervision for multi-tenant shops,
                global queue workers, and sensitive audit records without risking live production data.
              </p>
            </div>

            {/* Prototype Disclaimer Card */}
            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs leading-relaxed text-white/70 backdrop-blur-md max-w-xl">
              <div className="flex items-center gap-2 font-semibold text-white/90">
                <ShieldAlert className="size-4 text-amber-400" />
                <span>Security Notice: Demonstration Boundary</span>
              </div>
              <p className="mt-1 text-[11px] text-white/60">
                Mock sessions are isolated from the production identity system. Production deployment requires
                dedicated cross-tenant policies and multi-factor authorization.
              </p>
            </div>
          </section>

          {/* Right Column: Sign In Form */}
          <section className="flex min-h-screen flex-col justify-between bg-card p-6 sm:p-10 lg:p-14">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-default-900 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to Shop Login
              </Link>
              <Badge color="warning" className="text-xs">
                Local Prototype
              </Badge>
            </div>

            {/* Center Form Container */}
            <div className="mx-auto w-full max-w-md py-8">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 ring-1 ring-amber-600/20">
                  <LockKeyhole className="size-3.5" />
                  Preconfigured Sandbox Access
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-default-900">
                  Platform Admin Sign In
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Credentials are provided below for immediate UI demonstration.
                </p>
              </div>

              {/* Mock Credentials Fast-Copy Card */}
              <div className="mb-6 rounded-xl border border-default-200 bg-default-50/70 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Demo Email:</span>
                  <div className="flex items-center gap-1.5 font-mono text-default-800">
                    <span>{ADMIN_MOCK_EMAIL}</span>
                    <button
                      type="button"
                      onClick={() => void copy(ADMIN_MOCK_EMAIL, "email")}
                      className="rounded p-1 text-muted-foreground hover:bg-default-200 hover:text-default-900"
                      aria-label="Copy demo email"
                    >
                      {copied === "email" ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-default-200/60 pt-2">
                  <span className="text-muted-foreground">Demo Password:</span>
                  <div className="flex items-center gap-1.5 font-mono text-default-800">
                    <span>••••••••</span>
                    <button
                      type="button"
                      onClick={() => void copy(ADMIN_MOCK_PASSWORD, "password")}
                      className="rounded p-1 text-muted-foreground hover:bg-default-200 hover:text-default-900"
                      aria-label="Copy demo password"
                    >
                      {copied === "password" ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-default-700 mb-1.5">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 text-sm focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-default-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 text-sm pr-10 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-default-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  className="h-10 text-sm font-semibold shadow-sm"
                >
                  {loading ? "Starting sandbox session…" : "Enter Platform Admin Mock"}
                </Button>
              </form>

              {/* Permissions Preview */}
              <div className="mt-6 border-t border-default-200/70 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Simulated Mock Permissions ({ADMIN_MOCK_PERMISSIONS.length})
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {ADMIN_MOCK_PERMISSIONS.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-md bg-default-100 px-2 py-0.5 font-mono text-[10px] text-default-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="text-center text-xs text-muted-foreground">
              {BRAND.name} Multi-Tenant Architecture · Internal Evaluation
            </div>
          </section>
        </div>
      </main>
  );
}
