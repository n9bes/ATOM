import styles from './EditorPanel.module.css';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { CodeEditor } from './CodeEditor';
import type { WorkspaceAutomaton } from '../hooks/useAutomataWorkspace';

interface EditorPanelProps {
  automaton: WorkspaceAutomaton;
  onSourceChange: (value: string) => void;
  onCompile: () => void;
}

function statusFor(a: WorkspaceAutomaton): { label: string; tone: 'neutral' | 'accent' | 'danger' | 'warning' } {
  if (!a.compiled) return { label: 'Sin compilar', tone: 'neutral' };
  if (a.stale) return { label: 'Modificado · recompilá', tone: 'warning' };
  if (!a.compiled.ok) return { label: '1 error', tone: 'danger' };
  return { label: `${a.compiled.automata.esDeterminista ? 'AFD' : 'AFND'} ✓`, tone: 'accent' };
}

export function EditorPanel({ automaton, onSourceChange, onCompile }: EditorPanelProps) {
  const status = statusFor(automaton);
  const showError = !automaton.stale && automaton.compiled && !automaton.compiled.ok;
  const error = showError && !automaton.compiled!.ok ? automaton.compiled!.error : null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Editor — {automaton.name}.atom</span>
        <div className={styles.fill} />
        <Badge tone={status.tone}>{status.label}</Badge>
        <Button variant="primary" onClick={onCompile}>
          Compilar
        </Button>
      </div>
      <CodeEditor
        source={automaton.source}
        onChange={onSourceChange}
        errorLine={error?.line ?? null}
        errorTooltip={error ? { line: error.line, message: `${error.description}. Se encontró '${error.found}'` } : null}
      />
    </div>
  );
}
