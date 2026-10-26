import Cookies from "js-cookie";

export const cookieStorage = {
  get: (key: string): string | undefined => {
    return Cookies.get(key);
  },
  set: (key: string, value: string, options?: Cookies.CookieAttributes): void => {
    Cookies.set(key, value, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      ...options,
    });
  },
  remove: (key: string, options?: Cookies.CookieAttributes): void => {
    Cookies.remove(key, { path: "/", ...options });
  },
};

// Convenience helpers for authentication tokens
export const AUTH_TOKEN_KEY = "nexo_auth_token";

export const getAuthToken = (): string | undefined => cookieStorage.get(AUTH_TOKEN_KEY);
export const setAuthToken = (token: string, days = 7): void => {
  cookieStorage.set(AUTH_TOKEN_KEY, token, { expires: days });
};
export const removeAuthToken = (): void => {
  cookieStorage.remove(AUTH_TOKEN_KEY);
  cookieStorage.remove(AUTH_TOKEN_KEY, { path: "" });
  if (typeof document !== "undefined") {
    const paths = ["/", ""];
    paths.forEach((p) => {
      document.cookie = `${AUTH_TOKEN_KEY}=; path=${p}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
      document.cookie = `${AUTH_TOKEN_KEY}=; path=${p}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
    });
  }
};
