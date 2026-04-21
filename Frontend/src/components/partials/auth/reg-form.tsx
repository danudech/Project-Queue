"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { UserRegister, UserRegisterResponse } from "@/types/user";
import { useRouter } from "next/navigation";
import { storage } from "@/services/localstorage";

const RegForm = () => {
  const t = useTranslations("Auth");
  const [loading, setLoading] = React.useState(false);
  const locale = useLocale();
  const router = useRouter();
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<UserRegister>({
    defaultValues: {
      acceptTerms: false,
      phone: "",
      locale: "en",
    },
  });

  const onSubmit = async (data: UserRegister) => {
    if (loading) return;
    data.locale = locale;

    try {
      setLoading(true);

      const login = await http.post<UserRegisterResponse>("userregister", data);
      const message = login.code === "success" ? "Successfully registered" : login.code === "idle" ? "Registration is idle" : "Registration failed";
      toast.success(login.message || message);
      await storage.set("registration", JSON.stringify(data));
      // ✅ redirect หลัง login
      await sleep(2000);
      router.push(`/${locale}/auth/mail-confirm`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) => cn(
    "merged border rounded-md transition-all duration-200 flex items-center",
    "focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
    error ? "border-destructive" : "border-default-300"
  );

  const iconWrapperClass = "bg-transparent border-none text-default-500 px-2.5 flex items-center justify-center";
  const inputBaseClass = "border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full h-9 pl-1 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

      {/* FULL NAME */}
      <div className="space-y-1">
        <Label htmlFor="name" className="text-default-700 font-medium">Your Name</Label>
        <InputGroup className={getGroupClass(errors.name)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:user" fontSize={16} />
          </InputGroupText>
          <Input
            id="name"
            placeholder="Your Name"
            size="sm"
            {...register("name", { required: "Name is required" })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      {/* EMAIL */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-default-700 font-medium">Email</Label>
        <InputGroup className={getGroupClass(errors.email)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="ic:outline-email" fontSize={16} />
          </InputGroupText>
          <Input
            type="email"
            id="email"
            size="sm"
            placeholder="Your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>

      {/* PHONE (Optional but Validated if entered) */}
      <div className="space-y-1">
        <Label htmlFor="phone" className="text-default-700 font-medium">Phone (Optional)</Label>
        <InputGroup className={getGroupClass(errors.phone)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="tdesign:call" fontSize={16} />
          </InputGroupText>
          <Input
            id="phone"
            type="tel"
            size="sm"
            placeholder="08XXXXXXXX"
            {...register("phone", {
              required: false, // ไม่บังคับกรอก
              validate: (value) => {
                if (!value) return true; // ถ้าว่างให้ผ่าน
                if (!/^0/.test(value)) return "Phone number must start with 0";
                if (value.length !== 10) return "Phone number must be 10 digits";
                if (!/^\d+$/.test(value)) return "Numbers only";
                return true;
              }
            })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
      </div>

      {/* TERMS & CONDITIONS */}
      <div className="pt-2">
        <Controller
          name="acceptTerms"
          control={control}
          rules={{ required: "You must accept the terms" }}
          render={({ field }) => (
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onCheckedChange={field.onChange}
                className={cn(errors.acceptTerms && "border-destructive")}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal leading-tight cursor-pointer text-default-600">
                You accept our <a href="#" className="text-primary font-medium hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </Label>
            </div>
          )}
        />
        {errors.acceptTerms && <p className="text-xs text-destructive mt-1">{errors.acceptTerms.message}</p>}
      </div>
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        size="lg"
        className="w-full h-9 text-base shadow-sm mt-2 transition-all active:scale-[0.98]"
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? `${t("sign_up")}...` : t("sign_up")}
      </Button>
    </form>
  );
};

export default RegForm;