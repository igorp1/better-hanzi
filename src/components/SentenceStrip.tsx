import { Token } from "@/lib/tokenize";

type SentenceStripProps = {
  tokens: Token[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  showTitle?: boolean;
};

export function SentenceStrip({
  tokens,
  activeIndex,
  onSelect,
  showTitle = true,
}: SentenceStripProps) {
  if (!tokens.length) {
    return null;
  }

  return (
    <section className="panel">
      {showTitle ? <h2 className="sectionTitle">Sentence Strip</h2> : null}
      <div className="stripRow">
        {tokens.map((token) => {
          const display = token.isWhitespace ? "␠" : token.char;
          const isActive = activeIndex === token.index;

          return (
            <button
              key={`${token.index}-${token.char}`}
              className={`tile ${token.isRenderable ? "" : "is-disabled"} ${isActive ? "is-active" : ""}`}
              disabled={!token.isRenderable}
              onClick={() => onSelect?.(token.index)}
              type="button"
              aria-label={token.isWhitespace ? "Space" : token.char}
            >
              {display}
            </button>
          );
        })}
      </div>
    </section>
  );
}
