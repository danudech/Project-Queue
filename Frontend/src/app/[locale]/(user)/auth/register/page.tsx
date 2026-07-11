import AuthShell from "@/components/partials/auth/auth-shell";
import RegForm from "@/components/partials/auth/reg-form";

const Register = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  return (
    <AuthShell locale={locale} mode="register">
      <RegForm />
    </AuthShell>
  );
};

export default Register;
