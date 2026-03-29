import NextAuth from "next-auth";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
                async authorize(credentials) {
                    // Admin user (env-based; set ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_NAME in env)
                    const adminUser = process.env.ADMIN_USERNAME;
                    const adminPass = process.env.ADMIN_PASSWORD;
                    const adminName = process.env.ADMIN_NAME || "Admin";
                    if (
                        adminUser &&
                        adminPass &&
                        credentials?.username === adminUser &&
                        credentials?.password === adminPass
                    ) {
                        // Ensure the admin exists in the DB so profile updates work
                        const dbUrl = process.env.DATABASE_URL;
                        if (dbUrl) {
                            try {
                                const sql = neon(dbUrl);
                                await sql`
                                  INSERT INTO users (id, name, username, password, role)
                                  VALUES ('admin', ${adminName}, ${adminUser}, ${adminPass}, 'admin')
                                  ON CONFLICT (id) DO UPDATE
                                    SET name = EXCLUDED.name,
                                        username = EXCLUDED.username,
                                        password = EXCLUDED.password,
                                        role = EXCLUDED.role
                                `;
                            } catch (err) {
                                console.error("Failed to upsert admin in DB", err);
                            }
                        }
                        return { id: "admin", name: adminName, role: "admin", username: credentials.username };
                    }

                    // All other users: check Postgres via Neon
                    if (!credentials?.username || !credentials?.password) {
                        return null;
                    }
                    const dbUrl = process.env.DATABASE_URL;
                    if (!dbUrl) {
                        console.error("DATABASE_URL is not set");
                        return null;
                    }
                    try {
                        const sql = neon(dbUrl);
                        const rows = (await sql`
                          SELECT id, name, username, password, role
                          FROM users
                          WHERE username = ${credentials.username}
                          LIMIT 1
                        `) as { id: string; name: string; username: string; password: string; role: string | null }[];
                        const user = rows[0];
                        if (user && user.password === credentials.password) {
                            return {
                                id: user.id,
                                name: user.name,
                                username: user.username,
                                role: user.role || "user",
                            };
                        }
                        return null;
                    } catch (err) {
                        console.error("Auth query failed", err);
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
                    const u = user as { id: string; name?: string | null; role?: string; username?: string };
                    token.id = u.id;
                    token.name = u.name;
                    token.role = u.role;
                    if (u.username) token.username = u.username;
                }
                return token;
            },
            async session({ session, token }) {
                if (token) {
                    type SessionUser = { id?: string; name?: string | null; role?: string; username?: string };
                    const s = session as Session & { user?: SessionUser };
                    s.user = s.user || {};
                    s.user.id = token.id as string;
                    s.user.name = token.name as string | null;
                    s.user.role = token.role as string | undefined;
                    if (token.username) s.user.username = token.username as string;
                }
                return session;
            },
    },
});

export { handler as GET, handler as POST };
