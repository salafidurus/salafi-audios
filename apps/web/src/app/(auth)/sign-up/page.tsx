import { SignUpScreen } from "@sd/feature-auth";

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
