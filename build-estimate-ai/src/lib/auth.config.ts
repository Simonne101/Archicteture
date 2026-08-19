import type { NextAuthConfig } from "next-auth";

// Config split from auth.ts so middleware (Edge runtime) never has to bundle
// Prisma/bcrypt — only auth.ts (Node runtime) adds the Credentials provider.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "admin";
      }
      if (pathname.startsWith("/dashboard")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
