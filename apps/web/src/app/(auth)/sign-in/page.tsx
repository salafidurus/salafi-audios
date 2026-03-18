import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

type SignInPageProps = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.from ?? "/";

  return <SignInScreen redirectTo={redirectTo} />;
}
