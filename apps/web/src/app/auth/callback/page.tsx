'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/core/auth/auth-client';
import Link from 'next/link';

function AuthCallbackContent() {
  // All hooks called at top level - no conditional hook calls
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isLoading, error } = authClient.useSession();
  const [timeoutError, setTimeoutError] = useState(false);

  // Handle OAuth provider errors (user denied, invalid state, etc.)
  const oauthError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Timeout after 10 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setTimeoutError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Main authentication flow
  useEffect(() => {
    if (isLoading) return;

    if (session?.user) {
      // Session is valid (cookie was set during OAuth flow)
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    } else if (!error && !oauthError && !timeoutError) {
      // No session, OAuth failed silently
      router.replace('/sign-in?error=no_session');
    }
  }, [session, isLoading, router, searchParams, error, oauthError, timeoutError]);

  if (oauthError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">
            {errorDescription || `Error: ${oauthError}`}
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if (timeoutError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Timeout</h1>
          <p className="text-gray-600 mb-4">
            Authentication is taking longer than expected.
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Please try again
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
