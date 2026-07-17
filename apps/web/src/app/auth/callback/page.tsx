'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/core/auth/auth-client';
import Link from 'next/link';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { data: session, isLoading, error } = authClient.useSession();
  const [timeoutError, setTimeoutError] = useState(false);

  const errorDescription = searchParams.get('error_description');

  // Timeout after 10 seconds to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setTimeoutError(true);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

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

  // Session found - show success message and link to home
  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Successful</h1>
          <p className="text-gray-600 mb-6">
            You have been signed in successfully.
          </p>
          <Link
            href={searchParams.get('redirect') || '/'}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue to App
          </Link>
        </div>
      </div>
    );
  }

  // Loading state - session being verified
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
