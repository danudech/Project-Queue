"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChangePasswordForm from "@/components/partials/account/change-password-form";

export default function SecurityPage() {
  const t = useTranslations("AccountSecurity");
  const tMenu = useTranslations("Menu");

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("description")}
        </p>
      </div>

      <Card className="border shadow-lg bg-card overflow-hidden rounded-2xl relative">
        <CardHeader className="bg-slate-50 border-b pb-6">
          <CardTitle className="text-xl text-emerald-800">{t("change_password")}</CardTitle>
          <CardDescription>
            {t("change_password_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-8 pb-10">
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
