export type Token = {
  char: string;
  index: number;
  isHanzi: boolean;
  isWhitespace: boolean;
  isRenderable: boolean;
};

const HANZI_REGEX = /\p{Script=Han}/u;
const CONTEXT_CHAR_REGEX = /[\p{P}\s]/u;

export const isHanziChar = (char: string): boolean => HANZI_REGEX.test(char);
export const isContextChar = (char: string): boolean =>
  isHanziChar(char) || CONTEXT_CHAR_REGEX.test(char);

export const sanitizeChineseInput = (input: string): string => {
  return Array.from(input)
    .filter((char) => isContextChar(char))
    .join("");
};

export const tokenizeInput = (input: string): Token[] => {
  return Array.from(input).map((char, index) => {
    const isHanzi = isHanziChar(char);
    const isWhitespace = /^\s$/u.test(char);

    return {
      char,
      index,
      isHanzi,
      isWhitespace,
      isRenderable: isHanzi,
    };
  });
};

export const getHanziTokenIndices = (tokens: Token[]): number[] => {
  return tokens.filter((token) => token.isHanzi).map((token) => token.index);
};
