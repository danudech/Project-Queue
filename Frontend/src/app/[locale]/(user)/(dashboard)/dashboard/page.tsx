"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { useShop } from "@/hooks/use-me";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

const DashboardPage = () => {
  const { data: shopData, isLoading, refetch } = useShop();

  const handleCheckMe = async () => {
    try {
      const res = await http.get("profile");
      console.log("ME:", res);

      toast.success("Fetched profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch profile");
    }
  };

  return (
    <div className='space-y-6'>
        <Card>
          <CardContent className="p-0">

            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-6 w-[320px]">

                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <p className="text-gray-500">You are logged in 🎉</p>

                {/* ✅ ปุ่ม Check Me */}
                <Button
                  onClick={handleCheckMe}
                  className="w-full h-10"
                  variant="default"
                >
                  Check Me
                </Button>

              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default DashboardPage;