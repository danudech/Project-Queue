import AuthShell from "@/components/partials/auth/auth-shell";
import LoginForm from "@/components/partials/auth/login-form";

const Login = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  return (
    <AuthShell locale={locale} mode="login">
      <LoginForm />
    </AuthShell>
  );
};

export default Login;
