"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { StrokeViewer } from "@/components/StrokeViewer";
import { SentenceStrip } from "@/components/SentenceStrip";
import { CharDataResult, getCharData } from "@/lib/hanziData";
import {
  getHanziTokenIndices,
  sanitizeChineseInput,
  tokenizeInput,
} from "@/lib/tokenize";

const parseIndex = (value: string | null): number => {
  if (!value) {
    return Number.NaN;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : Number.NaN;
};

export default function ViewerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawQuery = searchParams.get("query") ?? "";
  const query = sanitizeChineseInput(rawQuery);
  const requestedIndex = parseIndex(searchParams.get("index"));

  const tokens = useMemo(() => tokenizeInput(query), [query]);
  const hanziIndices = useMemo(() => getHanziTokenIndices(tokens), [tokens]);

  const selectedIndex = useMemo(() => {
    if (hanziIndices.length === 0) {
      return -1;
    }

    if (
      !Number.isNaN(requestedIndex) &&
      hanziIndices.includes(requestedIndex)
    ) {
      return requestedIndex;
    }

    return hanziIndices[0] ?? -1;
  }, [hanziIndices, requestedIndex]);

  const selectedToken = selectedIndex >= 0 ? tokens[selectedIndex] : undefined;
  const selectedChar = selectedToken?.char ?? "";

  const [charData, setCharData] = useState<CharDataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStroke, setActiveStroke] = useState(0);
  const activeCharData = selectedChar ? charData : null;

  useEffect(() => {
    if (!selectedChar) {
      return;
    }

    let mounted = true;

    void Promise.resolve()
      .then(() => {
        if (mounted) {
          setLoading(true);
          setActiveStroke(0);
        }

        return getCharData(selectedChar);
      })
      .then((result) => {
        if (mounted) {
          setCharData(result);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedChar]);

  const pushViewerState = (nextIndex: number) => {
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("index", String(nextIndex));
    router.replace(`/viewer?${params.toString()}`);
  };

  const goToStroke = (step: number) => {
    if (
      !activeCharData ||
      activeCharData.missing ||
      activeCharData.strokeCount === 0
    ) {
      setActiveStroke(0);
      return;
    }

    const lastStroke = activeCharData.strokeCount - 1;
    setActiveStroke(Math.max(0, Math.min(step, lastStroke)));
  };

  if (!query) {
    return (
      <main className="page">
        <section
          className="panel"
          style={{ maxWidth: 640, margin: "64px auto" }}
        >
          <h1 className="title">Viewer</h1>
          <p className="mutedText">No query provided. Start from search.</p>
          <Link className="btn linkBtn" href="/">
            Go to Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page viewerPage">
      <div className="viewerTopBar">
        <Link className="btn linkBtn" href="/">
          ↩
        </Link>
      </div>

      <SentenceStrip
        tokens={tokens}
        activeIndex={selectedIndex}
        showTitle={false}
        onSelect={(index) => {
          if (!tokens[index]?.isHanzi) {
            return;
          }

          pushViewerState(index);
        }}
      />

      <StrokeViewer
        selectedChar={selectedChar}
        data={activeCharData}
        loading={loading}
        activeStroke={activeStroke}
        onPrevStroke={() => goToStroke(activeStroke - 1)}
        onNextStroke={() => goToStroke(activeStroke + 1)}
        onSelectStroke={goToStroke}
      />
    </main>
  );
}
