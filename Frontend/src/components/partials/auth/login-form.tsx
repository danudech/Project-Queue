"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { http } from "@/lib/http/client";
import { ProfileUser } from "@/types/profile-user";
import { useTranslations } from "next-intl";

const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters" }),
});

type LoginFormValues = z.infer<typeof schema>;

const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (loading) return;

    try {
      setLoading(true);

      const login = await http.post<ProfileUser>("userlogin", data);
      console.log("Login Response:", login);

      toast.success("Successfully logged in");

      // ✅ redirect หลัง login
      // router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) =>
    cn(
      "merged border rounded-md transition-all duration-200 flex items-center",
      "focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
      error ? "border-destructive" : "border-default-300",
      loading && "opacity-50 cursor-not-allowed"
    );

  const inputBaseClass = "border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full h-9 pl-1 text-sm";
  const iconWrapperClass = "bg-transparent border-none text-default-500 px-2.5 flex items-center justify-center";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("mt-5 2xl:mt-7 space-y-5", loading && "opacity-70 pointer-events-none")}
    >
      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-700">
          Email
        </Label>
        <InputGroup className={getGroupClass(errors.email)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="ic:outline-email" fontSize={16} />
          </InputGroupText>
          <Input
            disabled={loading}
            {...register("email")}
            type="email"
            id="email"
            placeholder="your-email@email.com"
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.email && (
          <p className="text-xs text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium text-default-700">
          Password
        </Label>
        <InputGroup className={getGroupClass(errors.password)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="material-symbols:lock-outline" fontSize={16} />
          </InputGroupText>
          <Input
            disabled={loading}
            {...register("password")}
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="your-password"
            className={inputBaseClass}
          />
          <InputGroupText
            className="bg-transparent border-none cursor-pointer hover:text-primary transition-colors px-2.5 text-default-400"
            onClick={() => !loading && setShowPassword(!showPassword)}
          >
            <Icon
              icon={
                showPassword
                  ? "basil:eye-outline"
                  : "basil:eye-closed-solid"
              }
              fontSize={16}
            />
          </InputGroupText>
        </InputGroup>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* REMEMBER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Checkbox id="checkbox" disabled={loading} />
          <Label
            htmlFor="checkbox"
            className="cursor-pointer text-sm text-default-600 font-normal leading-tight"
          >
            {t("keep_me")}
          </Label>
        </div>

        <Link
          href="/forgot-password"
          className="text-sm text-default-800 dark:text-default-400 leading-6 font-medium hover:underline"
        >
          {t("forgot_password")}
        </Link>
      </div>

      {/* BUTTON */}
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        size="lg"
        className="h-9 shadow-sm transition-all active:scale-[0.98]"
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? `${t("sign_in")}...` : t("sign_in")}
      </Button>
    </form>
  );
};

export default LoginForm;