import { useAccountProfile } from "../api/account.api";

export function useAccountScreen() {
  const { data: profile, isFetching, error } = useAccountProfile();

  return {
    profile,
    isFetching,
    error,
  };
}
