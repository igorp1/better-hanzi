"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { CharDataResult } from "@/lib/hanziData";

type StrokeViewerProps = {
  selectedChar: string;
  data: CharDataResult | null;
  loading: boolean;
  activeStroke: number;
  onPrevStroke: () => void;
  onNextStroke: () => void;
  onSelectStroke: (index: number) => void;
};

const FUTURE_COLOR = "#2e2e2e";
const DONE_COLOR = "#ffffff";
const ACTIVE_COLOR = "#ffffff";

const isFormFocused = () => {
  if (typeof document === "undefined") {
    return false;
  }

  const element = document.activeElement as HTMLElement | null;

  if (!element) {
    return false;
  }

  const tagName = element.tagName;

  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    element.isContentEditable
  );
};

export function StrokeViewer({
  selectedChar,
  data,
  loading,
  activeStroke,
  onPrevStroke,
  onNextStroke,
  onSelectStroke,
}: StrokeViewerProps) {
  const baseStrokeWidth = 2;
  const activeStrokeWidth = 3.5;
  const glyphGroupRef = useRef<SVGGElement | null>(null);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  const hasData = !!data && !data.missing && data.strokeCount > 0;
  const strokeCount = hasData ? data.strokeCount : 0;
  const clampedStroke =
    strokeCount > 0 ? Math.min(activeStroke, strokeCount - 1) : 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isFormFocused()) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevStroke();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNextStroke();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onNextStroke, onPrevStroke]);

  useLayoutEffect(() => {
    if (!hasData || !glyphGroupRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const bbox = glyphGroupRef.current?.getBBox();

      if (!bbox || bbox.width === 0 || bbox.height === 0) {
        setCenterOffset({ x: 0, y: 0 });
        return;
      }

      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      const next = {
        x: 512 - centerX,
        // Strokes are rendered with an inverted Y axis, so Y offset sign is reversed.
        y: centerY - 512,
      };

      setCenterOffset((prev) => {
        if (
          Math.abs(prev.x - next.x) < 0.1 &&
          Math.abs(prev.y - next.y) < 0.1
        ) {
          return prev;
        }

        return next;
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [data?.strokes, hasData, selectedChar]);

  return (
    <div className="viewerStack">
      <section className="panel viewerPanel">
        <div className="viewerCanvasWrap">
          {loading ? (
            <p className="mutedText">Loading stroke data...</p>
          ) : hasData && data ? (
            <svg
              className="viewerSvg"
              viewBox="0 0 1024 1024"
              role="img"
              aria-label={`${selectedChar} stroke order`}
            >
              <g transform={`translate(${centerOffset.x}, ${centerOffset.y})`}>
                <g ref={glyphGroupRef} transform="translate(0, 1024) scale(1, -1)">
                  {data.strokes.map((stroke, index) => {
                    const isFuture = index > clampedStroke;

                    if (!isFuture) {
                      return null;
                    }

                    return (
                      <path
                        key={`future-${index}`}
                        d={stroke}
                        fill={FUTURE_COLOR}
                        stroke={FUTURE_COLOR}
                        strokeWidth={baseStrokeWidth}
                        strokeLinejoin="round"
                      />
                    );
                  })}

                  {data.strokes.map((stroke, index) => {
                    const isDone = index < clampedStroke;

                    if (!isDone) {
                      return null;
                    }

                    return (
                      <path
                        key={`done-${index}`}
                        d={stroke}
                        fill={DONE_COLOR}
                        stroke={DONE_COLOR}
                        strokeWidth={baseStrokeWidth}
                        strokeLinejoin="round"
                      />
                    );
                  })}

                  {data.strokes[clampedStroke] ? (
                    <path
                      key={`active-${clampedStroke}`}
                      d={data.strokes[clampedStroke]}
                      fill={ACTIVE_COLOR}
                      stroke={ACTIVE_COLOR}
                      strokeWidth={activeStrokeWidth}
                      strokeLinejoin="round"
                    />
                  ) : null}
                </g>
              </g>
            </svg>
          ) : (
            <p className="mutedText">
              No data for {selectedChar || "this character"}.
            </p>
          )}
        </div>

        <div className="stepNavRow">
          <button
            type="button"
            className="btn stepArrow"
            onClick={onPrevStroke}
            aria-label="Previous stroke"
            disabled={!hasData || clampedStroke <= 0}
          >
            ←
          </button>

          <div className="dotStepper" aria-label="Stroke progress">
            {Array.from({ length: strokeCount }).map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`dotButton ${index < clampedStroke ? "is-done" : ""} ${index === clampedStroke ? "is-active" : ""}`}
                aria-label={`Go to stroke ${index + 1}`}
                onClick={() => onSelectStroke(index)}
                disabled={!hasData}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn stepArrow"
            onClick={onNextStroke}
            aria-label="Next stroke"
            disabled={!hasData || clampedStroke >= strokeCount - 1}
          >
            →
          </button>
        </div>
      </section>
    </div>
  );
}
