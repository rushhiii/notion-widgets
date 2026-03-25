import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Admin user (anime one)
                if (
                    credentials?.username === "rushisys" &&
                    credentials?.password === "dobi"
                ) {
                    return { id: "admin", name: "Admin", role: "admin" };
                }
                // User: nina
                if (
                    credentials?.username === "nina" &&
                    credentials?.password === "nina123"
                ) {
                    return { id: "nina", name: "Nina", role: "user" };
                }
                // User: nishi
                if (
                    credentials?.username === "nishi" &&
                    credentials?.password === "nishi123"
                ) {
                    return { id: "nishi", name: "Nishi", role: "user" };
                }
                return null;
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/prvt/login" },
});

export { handler as GET, handler as POST };
