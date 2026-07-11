import type { Token, TokenType } from '../domain/types';

/**
 * Analizador léxico de ATOM.
 * Tokeniza solamente: no valida sintaxis ni semántica (esa responsabilidad
 * es del parser). Espeja las reglas de src/models/Lexer.java.
 */

const KEYWORDS: Record<string, TokenType> = {
  automata: 'AUTOMATA',
  estados: 'ESTADOS',
  alfabeto: 'ALFABETO',
  inicial: 'INICIAL',
  aceptacion: 'ACEPTACION',
  transiciones: 'TRANSICIONES',
};

const isLetter = (c: string) => /[A-Za-z]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);
const isLetterOrDigit = (c: string) => /[A-Za-z0-9]/.test(c);
const isWhitespace = (c: string) => c !== '' && /\s/.test(c);

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  let line = 1;
  let column = 1;

  const scan = () => (position >= input.length ? '' : input[position]);
  const scanNext = () => (position + 1 >= input.length ? '' : input[position + 1]);

  const nextChar = () => {
    if (scan() === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    position++;
  };

  const readWord = () => {
    let word = '';
    while (position < input.length && (isLetterOrDigit(scan()) || scan() === '_')) {
      word += scan();
      nextChar();
    }
    return word;
  };

  while (position < input.length) {
    const current = scan();
    const startLine = line;
    const startColumn = column;

    if (isWhitespace(current)) {
      nextChar();
      continue;
    }
    if (current === '#') {
      while (position < input.length && scan() !== '\n') nextChar();
      continue;
    }

    if (current === '{') {
      tokens.push({ type: 'LLAVE_L', value: '{', line: startLine, column: startColumn });
      nextChar();
    } else if (current === '}') {
      tokens.push({ type: 'LLAVE_R', value: '}', line: startLine, column: startColumn });
      nextChar();
    } else if (current === ',') {
      tokens.push({ type: 'COMA', value: ',', line: startLine, column: startColumn });
      nextChar();
    } else if (current === '-' && scanNext() === '>') {
      tokens.push({ type: 'FLECHA', value: '->', line: startLine, column: startColumn });
      nextChar();
      nextChar();
    } else if (isLetter(current) || current === '_') {
      const word = readWord();
      tokens.push({ type: KEYWORDS[word] ?? 'IDENTIFICADOR', value: word, line: startLine, column: startColumn });
    } else if (isDigit(current)) {
      const symbol = readWord();
      tokens.push({ type: 'SIMBOLO', value: symbol, line: startLine, column: startColumn });
    } else {
      tokens.push({ type: 'ERROR', value: current, line: startLine, column: startColumn });
      nextChar();
    }
  }

  tokens.push({ type: 'EOF', value: '', line, column });
  return tokens;
}
