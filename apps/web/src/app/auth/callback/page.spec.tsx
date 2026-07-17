import { render, screen, waitFor } from '@testing-library/react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCallbackPage from './page';
import { authClient } from '@/core/auth/auth-client';

jest.mock('next/navigation');
jest.mock('@/core/auth/auth-client');

describe('AuthCallbackPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    });
  });

  it('shows loading state while session is being fetched', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AuthCallbackPage />);
    expect(screen.getByText(/Completing sign-in/i)).toBeTruthy();
  });

  it('redirects to dashboard on successful session', async () => {
    const searchParams = new URLSearchParams({ redirect: '/dashboard' });
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '123' } },
      isLoading: false,
      error: null,
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to root on successful session without redirect param', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '123' } },
      isLoading: false,
      error: null,
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('handles OAuth provider errors', () => {
    const searchParams = new URLSearchParams({
      error: 'access_denied',
      error_description: 'User denied access',
    });
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    render(<AuthCallbackPage />);
    expect(screen.getByText(/Authentication Failed/i)).toBeTruthy();
    expect(screen.getByText(/User denied access/i)).toBeTruthy();
  });

  it('handles timeout errors', async () => {
    jest.useFakeTimers();
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AuthCallbackPage />);
    jest.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(screen.getByText(/Authentication Timeout/i)).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('handles session errors', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Session validation failed'),
    });

    render(<AuthCallbackPage />);
    expect(screen.getByText(/Authentication Error/i)).toBeTruthy();
  });

  it('redirects to sign-in with error when no session', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/sign-in?error=no_session');
    });
  });
});
