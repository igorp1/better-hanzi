type HistoryPanelProps = {
  history: string[];
  onSelect: (query: string) => void;
};

export function HistoryPanel({ history, onSelect }: HistoryPanelProps) {
  return (
    <aside className="panel historyPanel">
      <h2 className="sectionTitle historyTitle">歷史</h2>
      {history.length === 0 ? (
        <p className="mutedText">No searches yet.</p>
      ) : (
        <ul className="historyList">
          {history.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="historyItem"
                onClick={() => onSelect(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
