"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useShop } from "@/hooks/use-me";
import { useBooking } from "@/hooks/use-booking";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user.store";
import { Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function BookingPage() {
  const t = useTranslations("CustomerBooking.bookService");
  const { data: shopData, isLoading: shopLoading } = useShop();
  const user = useAtomValue(userAtom);
  const { createBooking } = useBooking(user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (shopLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleBooking = async () => {
    setIsSubmitting(true);
    try {
      await createBooking.mutateAsync({
        customerId: user?.id ?? 0,
        serviceId: 1, // Mock service
        branchId: shopData?.shopBranches?.[0]?.id ?? 0,
        bookingDate: new Date().toISOString().split("T")[0],
        bookingTime: "10:00",
      });
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("shopTitle", { name: shopData?.name ?? t("unnamedShop") })}</CardTitle>
          <CardDescription>{t("cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBooking} disabled={isSubmitting || !user} className="w-full sm:w-auto gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {t("confirm")}
          </Button>
          {!user && <p className="text-sm text-destructive mt-2">{t("loginRequired")}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
