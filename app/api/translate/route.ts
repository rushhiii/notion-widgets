import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { q?: string; target?: string };
    const rawText = typeof body?.q === "string" ? body.q.trim() : "";
    if (!rawText) {
      return NextResponse.json({ translatedText: "" }, { status: 400 });
    }

    const text = rawText.slice(0, 280);
    const target = typeof body?.target === "string" && body.target ? body.target : "en";

    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `auto|${target}`);

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { responseData?: { translatedText?: string } };
      const translatedText = data?.responseData?.translatedText || "";
      if (translatedText && translatedText !== text) {
        return NextResponse.json({ translatedText });
      }
    }

    const googleUrl = new URL("https://translate.googleapis.com/translate_a/single");
    googleUrl.searchParams.set("client", "gtx");
    googleUrl.searchParams.set("sl", "auto");
    googleUrl.searchParams.set("tl", target);
    googleUrl.searchParams.set("dt", "t");
    googleUrl.searchParams.set("q", text);

    const googleResponse = await fetch(googleUrl.toString(), { cache: "no-store" });
    if (!googleResponse.ok) {
      return NextResponse.json({ translatedText: text });
    }

    const googleData = (await googleResponse.json()) as Array<Array<[string]>>;
    const translated = Array.isArray(googleData?.[0])
      ? googleData[0].map((chunk) => chunk?.[0] || "").join("")
      : "";
    return NextResponse.json({ translatedText: translated || text });
  } catch {
    return NextResponse.json({ translatedText: "" }, { status: 500 });
  }
}
