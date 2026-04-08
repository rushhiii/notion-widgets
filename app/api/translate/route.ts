import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { q?: string; target?: string; engine?: string };
    const rawText = typeof body?.q === "string" ? body.q.trim() : "";
    if (!rawText) {
      return NextResponse.json({ translatedText: "" }, { status: 400 });
    }

    const text = rawText.slice(0, 280);
    const target = typeof body?.target === "string" && body.target ? body.target : "en";
    const engine = body?.engine === "mymemory" || body?.engine === "google" ? body.engine : "auto";

    const translateWithGoogle = async () => {
      const googleUrl = new URL("https://translate.googleapis.com/translate_a/single");
      googleUrl.searchParams.set("client", "gtx");
      googleUrl.searchParams.set("sl", "auto");
      googleUrl.searchParams.set("tl", target);
      googleUrl.searchParams.set("dt", "t");
      googleUrl.searchParams.set("q", text);

      const googleResponse = await fetch(googleUrl.toString(), { cache: "no-store" });
      if (!googleResponse.ok) return null;
      const googleData = (await googleResponse.json()) as Array<Array<[string]>>;
      const translated = Array.isArray(googleData?.[0])
        ? googleData[0].map((chunk) => chunk?.[0] || "").join("")
        : "";
      if (!translated || translated === text) return null;
      return translated;
    };

    const translateWithMyMemory = async () => {
      const url = new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q", text);
      url.searchParams.set("langpair", `auto|${target}`);

      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) return null;
      const data = (await response.json()) as { responseData?: { translatedText?: string } };
      const translatedText = data?.responseData?.translatedText || "";
      if (!translatedText || translatedText === text) return null;
      return translatedText;
    };

    const useGoogleFirst = engine === "google" || engine === "auto";
    const first = useGoogleFirst ? translateWithGoogle : translateWithMyMemory;
    const second = useGoogleFirst ? translateWithMyMemory : translateWithGoogle;

    const primaryResult = await first();
    if (primaryResult) return NextResponse.json({ translatedText: primaryResult });

    const fallbackResult = await second();
    return NextResponse.json({ translatedText: fallbackResult || text });
  } catch {
    return NextResponse.json({ translatedText: "" }, { status: 500 });
  }
}
