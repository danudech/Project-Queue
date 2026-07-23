import AuthShell from "@/components/partials/auth/auth-shell";
import MailVerifyContent from "@/components/partials/auth/mail-verify-content";

const MailVerifyPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;

  return (
    <AuthShell locale={locale} showHeading={false}>
      <MailVerifyContent />
    </AuthShell>
  );
};

export default MailVerifyPage;
