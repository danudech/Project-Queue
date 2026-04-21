"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { http } from "@/lib/http/client";

const DashboardPage = () => {
  const router = useRouter();

  
  

  const handleLogout = async () => {
    try {
      const logout = await http.get("signout");
      console.log("Logout response:", logout);

      toast.success("Logged out");

      router.push("/auth/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="text-gray-500">You are logged in 🎉</p>

        <Button onClick={handleLogout} className="w-full h-10" variant="ghost">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
