export interface HighlightSpan {
  text: string;
  className: string;
}

const TOKEN_RE = /(automata|estados|alfabeto|inicial|aceptacion|transiciones)|(->)|([{}])|(,)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;

/** Resalta una línea de código ATOM en spans clasificados (sin color: los colores vienen del CSS del tema). */
export function highlightLine(text: string): HighlightSpan[] {
  const spans: HighlightSpan[] = [];
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    const token = match[0];
    let className = 'tok-default';
    if (match[1]) className = 'tok-keyword';
    else if (match[2]) className = 'tok-arrow';
    else if (match[3]) className = 'tok-brace';
    else if (match[4]) className = 'tok-comma';
    else if (match[5]) className = 'tok-identifier';
    spans.push({ text: token, className });
  }

  if (spans.length === 0) spans.push({ text: ' ', className: 'tok-default' });
  return spans;
}
