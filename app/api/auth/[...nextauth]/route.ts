import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace with your own secure check
        if (
          credentials?.username === "rtuisrhtih@12050912!%" &&
          credentials?.password === "dobidobi"
        ) {
          return { id: "admin", name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/prvt/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
