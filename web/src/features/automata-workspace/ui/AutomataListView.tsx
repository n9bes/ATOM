import styles from './AutomataListView.module.css';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import type { WorkspaceAutomaton } from '../hooks/useAutomataWorkspace';

interface AutomataListViewProps {
  automatons: WorkspaceAutomaton[];
  onSelect: (id: string) => void;
  onNewAutomaton: () => void;
}

function badgeFor(a: WorkspaceAutomaton): { label: string; tone: 'neutral' | 'accent' | 'danger' | 'warning' } {
  if (!a.compiled) return { label: 'Sin compilar', tone: 'neutral' };
  if (a.stale) return { label: 'Modificado', tone: 'warning' };
  if (a.compiled.ok) return { label: a.compiled.automata.esDeterminista ? 'AFD' : 'AFND', tone: 'accent' };
  return { label: 'Error', tone: 'danger' };
}

export function AutomataListView({ automatons, onSelect, onNewAutomaton }: AutomataListViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tus autómatas</h1>
        <Button variant="primary" onClick={onNewAutomaton}>
          + Nuevo autómata
        </Button>
      </div>

      {automatons.length === 0 ? (
        <div className={styles.empty}>
          No tenés autómatas guardados todavía. Creá uno nuevo o cargá un ejemplo desde la izquierda.
        </div>
      ) : (
        <div className={styles.grid}>
          {automatons.map((a) => {
            const badge = badgeFor(a);
            const estados = a.compiled?.ok ? a.compiled.automata.estados.length : '—';
            const alfabeto = a.compiled?.ok ? a.compiled.automata.alfabeto.length : '—';
            return (
              <div key={a.id} className={styles.card} onClick={() => onSelect(a.id)}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{a.name}</span>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
                <div className={styles.cardMeta}>
                  {estados} estados · {alfabeto} símbolos
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
