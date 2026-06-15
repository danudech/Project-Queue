"use client";

import { Card, CardContent } from "@/components/ui/card";
import ServicePage from "../tb-sevice-list";

export default function ServiceListAliasPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <ServicePage />
        </CardContent>
      </Card>
    </div>
  );
}
