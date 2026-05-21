"use client";

import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { Card, CardContent } from "@/components/ui/card";

const SettingHolidayPage = () => {

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className="p-0">
          <p>Setting holiday Page</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingHolidayPage;