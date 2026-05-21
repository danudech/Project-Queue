"use client";

import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { Card, CardContent } from "@/components/ui/card";

const NotificationPage = () => {

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className="p-0">
          <p>Notification Page</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;