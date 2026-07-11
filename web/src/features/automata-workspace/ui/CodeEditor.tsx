import { useMemo, useRef, type KeyboardEvent } from 'react';
import styles from './CodeEditor.module.css';
import { highlightLine } from '../utilities/highlight';

interface CodeEditorProps {
  source: string;
  onChange: (value: string) => void;
  errorLine?: number | null;
  errorTooltip?: { line: number; message: string } | null;
}

const LINE_HEIGHT = 25.35;
const TOP_PADDING = 16;

export function CodeEditor({ source, onChange, errorLine, errorTooltip }: CodeEditorProps) {
  const preRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => source.split('\n'), [source]);

  const handleScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const tooltipTop = errorTooltip
    ? Math.round(TOP_PADDING + (errorTooltip.line - 1) * LINE_HEIGHT + LINE_HEIGHT + 6)
    : 0;

  // Por defecto el navegador usa Tab para mover el foco al siguiente elemento; acá lo
  // interceptamos para que inserte indentación, como en un editor de código real.
  // execCommand mantiene el undo (Ctrl+Z) funcionando, a diferencia de splicear el string.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const textarea = e.currentTarget;
    const inserted = document.execCommand?.('insertText', false, '  ');
    if (!inserted) {
      const { selectionStart, selectionEnd, value } = textarea;
      const next = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div ref={preRef} className={styles.highlightLayer} aria-hidden="true">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={styles.line}
            style={errorLine === idx + 1 ? { background: 'var(--danger-bg)' } : undefined}
          >
            <span className={styles.lineNumber}>{idx + 1}</span>
            <span>
              {highlightLine(line || ' ').map((span, i) => (
                <span key={i} className={styles[span.className]}>
                  {span.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={source}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />
      {errorTooltip && (
        <div className={styles.errorTooltip} style={{ top: tooltipTop }}>
          <div className={styles.errorTitle}>⚠ Línea {errorTooltip.line}</div>
          {errorTooltip.message}
        </div>
      )}
    </div>
  );
}
