"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { HistoryPanel } from "@/components/HistoryPanel";
import { SearchBar } from "@/components/SearchBar";
import { loadHistory, pushHistory } from "@/lib/history";
import { sanitizeChineseInput } from "@/lib/tokenize";

export default function HomePage() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHistory(loadHistory());
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const submitSearch = () => {
    const sanitized = sanitizeChineseInput(inputValue);

    if (!sanitized) {
      return;
    }

    setInputValue(sanitized);
    const nextHistory = pushHistory(sanitized);
    setHistory(nextHistory);
    router.push(`/viewer?query=${encodeURIComponent(sanitized)}`);
  };

  const selectHistoryItem = (item: string) => {
    setInputValue(item);
    router.push(`/viewer?query=${encodeURIComponent(item)}`);
  };

  return (
    <main className="page homePage">
      <div className="homeLayout mainColumn">
        <SearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={submitSearch}
        />
        <HistoryPanel history={history} onSelect={selectHistoryItem} />
      </div>
    </main>
  );
}
