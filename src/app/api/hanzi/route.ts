import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type HanziWriterRaw = {
  strokes: string[];
  medians: number[][][];
};

const charFileCache = new Map<string, Promise<HanziWriterRaw | null>>();

const readCharacter = async (char: string): Promise<HanziWriterRaw | null> => {
  const cached = charFileCache.get(char);

  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const filePath = path.join(
      process.cwd(),
      "node_modules",
      "hanzi-writer-data",
      `${char}.json`,
    );

    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as HanziWriterRaw;

      if (!Array.isArray(parsed.strokes)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  })();

  charFileCache.set(char, promise);

  return promise;
};

export async function GET(request: NextRequest) {
  const char = request.nextUrl.searchParams.get("char") ?? "";

  if (!char || Array.from(char).length !== 1 || /[\\/]/u.test(char)) {
    return NextResponse.json(
      { error: "Invalid char parameter" },
      { status: 400 },
    );
  }

  const data = await readCharacter(char);

  if (!data) {
    return NextResponse.json({ error: `No data for ${char}` }, { status: 404 });
  }

  return NextResponse.json({ char, data });
}
