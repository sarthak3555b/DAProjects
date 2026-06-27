import type { NextAuthConfig } from "next-auth";

const PROTECTED = [
  "/dashboard", "/roadmap", "/node", "/projects", "/resources",
  "/affairs", "/journal", "/analytics", "/career", "/settings", "/admin",
];

/** Edge-safe config (no Node-only deps). Providers added in auth.ts. */
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
      const isAdmin = path.startsWith("/admin");

      if (isProtected) {
        if (!isLoggedIn) return false; // redirect to signIn
        if (isAdmin && (auth!.user as any).role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      // redirect logged-in users away from auth pages
      if (isLoggedIn && (path === "/login" || path === "/register")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub!;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
} satisfies NextAuthConfig;
