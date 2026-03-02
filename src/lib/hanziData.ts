type HanziWriterRaw = {
  strokes: string[];
  medians: number[][][];
};

export type CharDataResult = {
  char: string;
  strokes: string[];
  medians: number[][][];
  strokeCount: number;
  missing: boolean;
};

const rawCache = new Map<string, Promise<HanziWriterRaw | null>>();
const resultCache = new Map<string, Promise<CharDataResult>>();

const fetchRawCharacter = async (
  char: string,
): Promise<HanziWriterRaw | null> => {
  if (!char) {
    return null;
  }

  const cached = rawCache.get(char);

  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const response = await fetch(`/api/hanzi?char=${encodeURIComponent(char)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load hanzi data for ${char}`);
    }

    const payload = (await response.json()) as { data: HanziWriterRaw };

    return payload.data;
  })();

  rawCache.set(char, promise);

  return promise;
};

export const getCharData = async (char: string): Promise<CharDataResult> => {
  const cacheKey = char;
  const cached = resultCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const promise = (async (): Promise<CharDataResult> => {
    const raw = await fetchRawCharacter(char);

    if (raw) {
      return {
        char,
        strokes: raw.strokes,
        medians: raw.medians,
        strokeCount: raw.strokes.length,
        missing: false,
      };
    }

    return {
      char,
      strokes: [],
      medians: [],
      strokeCount: 0,
      missing: true,
    };
  })();

  resultCache.set(cacheKey, promise);

  return promise;
};
