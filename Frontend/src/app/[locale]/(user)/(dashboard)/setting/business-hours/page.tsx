"use client";

import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { Card, CardContent } from "@/components/ui/card";

const SettingBusinessHoursPage = () => {

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className="p-0">
          <p>Setting business-hours Page</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingBusinessHoursPage;