import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Database from "better-sqlite3";
import path from "path";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
                async authorize(credentials) {
                    // Admin user (hardcoded)
                    if (
                        credentials?.username === "rushisys" &&
                        credentials?.password === "dobi"
                    ) {
                        return { id: "admin", name: "Rushi", role: "admin", username: credentials.username };
                    }

                    // All other users: check SQLite DB
                    if (!credentials?.username || !credentials?.password) return null;
                    try {
                        const dbPath = path.join(process.cwd(), "app", "api", "auth", "users.db");
                        console.log('NEXTAUTH: dbPath', dbPath);
                        const db = new Database(dbPath);
                        const user = db.prepare(
                            "SELECT id, name, username, password, role FROM users WHERE username = ?"
                        ).get(credentials.username);
                        console.log('NEXTAUTH: user found', user);
                        db.close();
                        if (user && user.password === credentials.password) {
                            return {
                                id: user.id,
                                name: user.name,
                                username: user.username,
                                role: user.role || "user",
                            };
                        }
                        return null;
                    } catch (e) {
                        return null;
                    }
                },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/prvt/login" },
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token.id = user.id;
                    token.name = user.name;
                    token.role = user.role;
                    if (user.username) token.username = user.username;
                }
                return token;
            },
            async session({ session, token }) {
                if (token) {
                    session.user.id = token.id;
                    session.user.name = token.name;
                    session.user.role = token.role;
                    if (token.username) session.user.username = token.username;
                }
                return session;
            },
    },
});

export { handler as GET, handler as POST };
