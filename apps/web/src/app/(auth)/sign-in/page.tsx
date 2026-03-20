import { SignInScreen } from "@sd/feature-auth";

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
