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
                if (
                    //   credentials?.username === "rtuisrhtih@12050912!%" &&
                    //   credentials?.password === "dobidobi"
                    credentials?.username === "rushisys" &&
                    credentials?.password === "dobi"


                ) {
                    return { id: "admin", name: "Admin" };
                }
                return null;
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/prvt/login" },
});

export { handler as GET, handler as POST };
