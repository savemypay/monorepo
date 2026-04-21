import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectPath = params.redirect && params.redirect.startsWith("/") ? params.redirect : "/";

  return <LoginForm redirectPath={redirectPath} />;
}
