"use client";

import { Card, CardContent } from "@/components/ui/card";
import ServicePage from "./tb-sevice-list";

const CategoryPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <ServicePage />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPage;
