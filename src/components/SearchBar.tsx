import { FormEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="searchRow singleInput">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="textInput"
          placeholder="你想写什么?"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search text"
        />
      </div>
    </form>
  );
}
