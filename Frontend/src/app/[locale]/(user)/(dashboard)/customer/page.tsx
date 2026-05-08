"use client";

import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { Card, CardContent } from "@/components/ui/card";
import ServicePage from "./tb-customer-list";

const CategoryPage = () => {

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className="p-0">
          <ServicePage />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPage;