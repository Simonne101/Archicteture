import { apiRequest } from "./api";

export type AccountType = "demo" | "free" | "pro" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  job_title: string | null;
  account_type: AccountType;
  organization_id: string | null;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await apiRequest<Envelope<AuthUser>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await apiRequest<Envelope<AuthUser>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", { method: "POST" });
  },

  async me(): Promise<AuthUser> {
    const res = await apiRequest<Envelope<AuthUser>>("/auth/me");
    return res.data;
  },
};
