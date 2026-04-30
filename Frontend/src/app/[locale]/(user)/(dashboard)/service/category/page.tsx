"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { http } from "@/lib/http/client";

const DashboardPage = () => {

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
    
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-6 w-[320px]">

          <h1 className="text-2xl font-semibold">Category</h1>

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
  );
};

export default DashboardPage;