import AuthShell from "@/components/partials/auth/auth-shell";
import ResetPasswordForm from "@/components/partials/auth/reset-password-form";
import { getTranslations } from "next-intl/server";

const ResetPasswordPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const t = await getTranslations("ResetPassword");

  return (
    <AuthShell
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("header")}
      subtitle={t("desc")}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
};

export default ResetPasswordPage;
