import styles from './RightPanel.module.css';
import { Badge } from '../../../components/Badge';
import { GraphView } from './GraphView';
import { SimulationPanel } from './SimulationPanel';
import { TokensTable } from './TokensTable';
import type { WorkspaceAutomaton } from '../hooks/useAutomataWorkspace';
import type { Token } from '../domain/types';

type RightTab = 'diagrama' | 'tokens';

interface SimState {
  input: string;
  symbols: string[] | null;
  trace: { estados: string[]; simbolo: string | null }[] | null;
  stepIndex: number;
  playing: boolean;
  error: string | null;
}

interface RightPanelProps {
  automaton: WorkspaceAutomaton;
  rightTab: RightTab;
  onSetRightTab: (tab: RightTab) => void;
  sim: SimState;
  currentAccepted: boolean | null;
  onSimInputChange: (value: string) => void;
  onSimStart: () => void;
  onSimStepPrev: () => void;
  onSimStepNext: () => void;
  onSimTogglePlay: () => void;
}

function tokensOf(a: WorkspaceAutomaton): Token[] | null {
  if (!a.compiled) return null;
  return a.compiled.ok ? a.compiled.automata.tokens : a.compiled.tokens;
}

export function RightPanel({
  automaton,
  rightTab,
  onSetRightTab,
  sim,
  currentAccepted,
  onSimInputChange,
  onSimStart,
  onSimStepPrev,
  onSimStepNext,
  onSimTogglePlay,
}: RightPanelProps) {
  const graphReady = !!automaton.compiled?.ok && !automaton.stale;
  const graphEmptyMessage = automaton.stale
    ? 'El autómata cambió — recompilá para ver el diagrama actualizado.'
    : automaton.compiled && !automaton.compiled.ok
      ? 'Corregí los errores y compilá de nuevo para ver el diagrama.'
      : !automaton.compiled
        ? 'Compilá el autómata para ver el diagrama de estados.'
        : null;

  const canSimulate = graphReady;
  const cannotSimulateMessage = automaton.stale
    ? 'El autómata cambió — recompilá para poder simular.'
    : automaton.compiled && !automaton.compiled.ok
      ? 'Corregí los errores de compilación para poder simular.'
      : 'Compilá el autómata para poder simular cadenas.';

  const activeStates = new Set(sim.trace ? sim.trace[sim.stepIndex].estados : []);
  const tokens = tokensOf(automaton);
  const noTokensMessage = automaton.compiled
    ? 'No hay tokens para mostrar.'
    : 'Compilá el autómata para ver la tabla de tokens.';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <span
            className={rightTab === 'diagrama' ? styles.tabActive : styles.tab}
            onClick={() => onSetRightTab('diagrama')}
          >
            Diagrama
          </span>
          <span className={rightTab === 'tokens' ? styles.tabActive : styles.tab} onClick={() => onSetRightTab('tokens')}>
            Tokens
          </span>
        </div>
        {automaton.compiled?.ok && !automaton.stale && (
          <Badge tone="accent">{automaton.compiled.automata.esDeterminista ? 'AFD' : 'AFND'}</Badge>
        )}
      </div>

      {rightTab === 'diagrama' ? (
        <>
          {graphReady && automaton.compiled?.ok ? (
            <GraphView key={automaton.id} automata={automaton.compiled.automata} activeStates={activeStates} />
          ) : (
            <div className={styles.graphEmpty}>{graphEmptyMessage}</div>
          )}
          <SimulationPanel
            canSimulate={canSimulate}
            cannotSimulateMessage={cannotSimulateMessage}
            sim={sim}
            currentAccepted={currentAccepted}
            onInputChange={onSimInputChange}
            onStart={onSimStart}
            onStepPrev={onSimStepPrev}
            onStepNext={onSimStepNext}
            onTogglePlay={onSimTogglePlay}
          />
        </>
      ) : (
        <TokensTable tokens={tokens} emptyMessage={noTokensMessage} />
      )}
    </div>
  );
}
