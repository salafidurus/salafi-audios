import { SignUpScreen } from "@/features/auth/screens/sign-up/sign-up.screen";

type SignUpPageProps = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectTo = params.from ?? "/";

  return <SignUpScreen redirectTo={redirectTo} />;
}
