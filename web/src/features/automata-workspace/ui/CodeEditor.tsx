import { useMemo, useRef } from 'react';
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
