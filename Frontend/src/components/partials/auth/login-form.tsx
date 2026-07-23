"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { Icon } from "@/components/ui/icon";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { http } from "@/lib/http/client";
import { ProfileUser } from "@/types/user";
import { useTranslations } from "next-intl";
import { storage } from "@/services/localstorage";
import { useSearchParams } from "next/navigation";
import { startRouteLoading } from "@/lib/route-loading";

const getSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    email: z.string().email({ message: t("validation.emailInvalid") }),
    password: z
      .string()
      .min(4, { message: t("validation.passwordLength") }),
    remember: z.boolean().optional(),
  });

type LoginFormValues = z.infer<ReturnType<typeof getSchema>>;

const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations("Auth.login");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const searchParams = useSearchParams();
  const schema = useMemo(() => getSchema(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    const loadRemembered = async () => {
      const remembered = (await storage.get("remember")) as string | null;

      if (!remembered) return;

      try {
        const data: LoginFormValues = JSON.parse(remembered);

        reset({
          email: data.email ?? "",
          password: data.password ?? "",
          remember: data.remember ?? false,
        });
      } catch (err) {
        console.error("Invalid remember data");
      }
    };

    loadRemembered();
  }, [reset]);

  const onSubmit = async (data: LoginFormValues) => {
    if (loading) return;

    try {
      setLoading(true);

      const login = await http.post<ProfileUser>("userlogin", data);
      toast.success(t("toast.success"));

      if (data.remember) {
        await storage.set("remember", JSON.stringify(data));
      } else {
        localStorage.removeItem("remember");
      }

      const returnUrl = searchParams.get("returnUrl");
      if (login.isChangPassword) {
        startRouteLoading();
        router.push(
          "/auth/resetpassword?returnUrl=" +
          encodeURIComponent(returnUrl || "/dashboard"),
        );
        return;
      }

      let redirectTo = "/dashboard";

      if (returnUrl) {
        redirectTo = returnUrl.replace(/^\/(th|en)/, "") || "/dashboard";
      }

      startRouteLoading();
      router.push(redirectTo);
    } catch (err: any) {
      toast.error(err.message || t("toast.error"));
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) =>
    cn(
      "merged flex h-12 items-center rounded-md border bg-white transition-colors duration-200",
      "focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100",
      error ? "border-destructive" : "border-slate-200",
      loading && "opacity-50 cursor-not-allowed",
    );

  const inputBaseClass =
    "h-11 w-full border-none bg-transparent pl-1 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  const iconWrapperClass =
    "flex items-center justify-center border-none bg-transparent px-3 text-slate-400";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "space-y-6",
        loading && "opacity-70 pointer-events-none",
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-800">
          {t("email")}
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
            placeholder={t("emailPlaceholder")}
            className={inputBaseClass}
          />
        </InputGroup>

        {errors.email && (
          <p className="text-xs text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-slate-800">
          {t("password")}
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
            placeholder={t("passwordPlaceholder")}
            className={inputBaseClass}
          />

          <InputGroupText
            className="bg-transparent border-none cursor-pointer hover:text-primary transition-colors px-2.5 text-default-400"
            onClick={() => !loading && setShowPassword(!showPassword)}
          >
            <Icon
              icon={
                showPassword ? "basil:eye-outline" : "basil:eye-closed-solid"
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

      <div className="flex justify-between items-center">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 items-center">
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal leading-tight text-slate-600"
              >
                {t("keepMe")}
              </Label>
            </div>
          )}
        />

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium leading-6 text-slate-900 hover:underline"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={loading}
        size="lg"
        className="h-12 rounded-md bg-emerald-700 text-base font-semibold text-white shadow-none transition-colors hover:bg-emerald-800 hover:text-white active:bg-emerald-900"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
};

export default LoginForm;
