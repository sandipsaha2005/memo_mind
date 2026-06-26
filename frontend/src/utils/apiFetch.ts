import { useAuthStore } from "../store/authStore";

const handleUnauthorized = () => {
  useAuthStore.getState().logout();
  window.location.replace("/login");
};

export const apiFetch = async (
  input: string,
  init?: RequestInit,
): Promise<Response> => {
  const res = await fetch(input, { ...init, credentials: "include" });

  if (res.status === 401) {
    handleUnauthorized();
  }

  return res;
};
