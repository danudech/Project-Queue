"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user.store";
import { useBooking } from "@/hooks/use-booking";
import { Loader2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function QueueStatusPage() {
  const t = useTranslations("QueueStatus");
  const user = useAtomValue(userAtom);
  const { getBookings } = useBooking(user?.id);

  if (getBookings.isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <div className="grid gap-4">
        {getBookings.data?.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p>{t("empty")}</p>
            </CardContent>
          </Card>
        ) : (
          getBookings.data?.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{t("serviceQueue")}</CardTitle>
                    <CardDescription>{t("dateTime", { date: booking.bookingDate, time: booking.bookingTime })}</CardDescription>
                  </div>
                  <Badge color="secondary" className="uppercase">{booking.status}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
