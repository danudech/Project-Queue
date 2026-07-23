import AuthShell from "@/components/partials/auth/auth-shell";
import ForgotPass from "@/components/partials/auth/forgot-pass";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

const ForgotPasswordPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const t = await getTranslations("ForgotPassword");

  return (
    <AuthShell
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("forgot_title")}
      subtitle={t("forgot_subtitle")}
    >
      <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
        {t("forgot_instructions")}
      </div>

      <ForgotPass />

      <div className="mt-8 text-center">
        <Link
          href="/auth/login"
          locale={locale}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back_to_login")}
        </Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
