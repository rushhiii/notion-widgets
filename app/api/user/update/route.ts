import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

type UpdateBody = {
  id: string;
  name?: string;
  username: string;
  password?: string;
};

export async function POST(req: Request) {
    try {
        const parsed = await req.json().catch((err: unknown) => {
            return { __error: err };
        });
        if ((parsed as { __error?: unknown }).__error) {
            const err = (parsed as { __error: unknown }).__error;
            const msg = err instanceof Error ? err.message : String(err);
            return NextResponse.json({ error: "Invalid JSON in request", details: msg }, { status: 400 });
        }

        const body = parsed as Partial<UpdateBody>;
        const { id, name, username, password } = body;

        if (!id || !username) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 500 });
        }

        const sql = neon(dbUrl);

        // Ensure username uniqueness (exclude self)
        const conflict = (await sql`
            SELECT id FROM users WHERE username = ${username} AND id != ${id} LIMIT 1
        `) as { id: string }[];
        if (conflict.length > 0) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        await sql`
            UPDATE users
            SET name = COALESCE(${name}, name), username = ${username}, password = COALESCE(${password}, password)
            WHERE id = ${id}
        `;

        const updated = (await sql`
            SELECT id, name, username, role FROM users WHERE id = ${id}
        `) as { id: string; name: string | null; username: string; role: string | null }[];

        return NextResponse.json({ success: true, user: updated[0] }, { status: 200 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: "Server error", details: msg }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";