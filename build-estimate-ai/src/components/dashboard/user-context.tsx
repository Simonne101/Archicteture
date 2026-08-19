"use client";

import { createContext, useContext } from "react";

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
  company: string | null;
}

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): CurrentUser {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return user;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
