import AuthShell from "@/components/partials/auth/auth-shell";
import MailConfirmContent from "@/components/partials/auth/mail-confirm-content";
import { getTranslations } from "next-intl/server";

const MailConfirmPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const t = await getTranslations("EmailConfirmation");

  return (
    <AuthShell
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("check_email_title")}
      subtitle={`${t("check_email_desc_1")} ${t("check_email_desc_2")}`}
    >
      <MailConfirmContent />
    </AuthShell>
  );
};

export default MailConfirmPage;
