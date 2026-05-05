"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { http } from "@/lib/http/client";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import ExampleTwo from "@/components/partials/react-table";

const CategoryPage = () => {

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

    <div>
      <SiteBreadcrumb />
      <div className='space-y-6'>
        <Card>
          <CardContent className="p-0">
            <ExampleTwo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryPage;