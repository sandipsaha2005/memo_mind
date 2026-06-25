const handleUnauthorized = () => {
  localStorage.removeItem("isLoggedIn");
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
