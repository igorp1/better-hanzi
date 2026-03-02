const HISTORY_KEY = "hanzi-trainer-history";
export const HISTORY_LIMIT = 30;

export const loadHistory = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

export const saveHistory = (history: string[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const pushHistory = (query: string, limit = HISTORY_LIMIT): string[] => {
  const normalized = query.trim();

  if (!normalized) {
    return loadHistory();
  }

  const current = loadHistory();
  const deduped = [
    normalized,
    ...current.filter((item) => item !== normalized),
  ];
  const next = deduped.slice(0, limit);

  saveHistory(next);

  return next;
};
