import styles from './SimulationPanel.module.css';
import { IconButton } from '../../../components/IconButton';
import { Button } from '../../../components/Button';

interface SimState {
  input: string;
  symbols: string[] | null;
  trace: { estados: string[]; simbolo: string | null }[] | null;
  stepIndex: number;
  playing: boolean;
  error: string | null;
}

interface SimulationPanelProps {
  canSimulate: boolean;
  cannotSimulateMessage: string | null;
  sim: SimState;
  currentAccepted: boolean | null;
  onInputChange: (value: string) => void;
  onStart: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onTogglePlay: () => void;
}

export function SimulationPanel({
  canSimulate,
  cannotSimulateMessage,
  sim,
  currentAccepted,
  onInputChange,
  onStart,
  onStepPrev,
  onStepNext,
  onTogglePlay,
}: SimulationPanelProps) {
  if (!canSimulate) {
    return (
      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Simular cadena</div>
        <div className={styles.cannotSimulate}>{cannotSimulateMessage}</div>
      </div>
    );
  }

  const symbols = sim.symbols ?? [];
  const trace = sim.trace;
  const activeStates = trace ? trace[sim.stepIndex].estados : [];
  const atEnd = trace ? sim.stepIndex === trace.length - 1 : false;
  const rejected = trace ? activeStates.length === 0 : false;

  let statusLabel = '';
  let statusTone: 'accent' | 'danger' = 'accent';
  if (trace) {
    if (rejected) {
      statusLabel = `Paso ${sim.stepIndex} de ${symbols.length} · sin transición posible — RECHAZADA`;
      statusTone = 'danger';
    } else if (atEnd) {
      statusLabel = currentAccepted ? 'ACEPTADA ✓' : 'RECHAZADA ✕';
      statusTone = currentAccepted ? 'accent' : 'danger';
    } else {
      statusLabel = `Paso ${sim.stepIndex} de ${symbols.length} · en ejecución`;
      statusTone = 'accent';
    }
  }

  const traceText = trace
    ? trace
        .slice(0, sim.stepIndex + 1)
        .map((step) => (step.estados.length ? `{${step.estados.join(',')}}` : '∅'))
        .join(' → ')
    : '';

  return (
    <div className={styles.panel}>
      <div className={styles.sectionTitle}>Simular cadena</div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={sim.input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="ej. 0 1 1 0"
        />
        <Button variant="primary" onClick={onStart}>
          Simular
        </Button>
      </div>
      {sim.error && <div className={styles.errorText}>⚠ {sim.error}</div>}

      {trace && (
        <>
          <div className={styles.charRow}>
            {symbols.map((symbol, idx) => {
              const done = idx < sim.stepIndex;
              const isCurrent = idx === sim.stepIndex;
              const cls = isCurrent ? styles.charBoxCurrent : done ? styles.charBoxDone : styles.charBox;
              return (
                <div key={idx} className={cls}>
                  {symbol}
                </div>
              );
            })}
            <div className={styles.fill} />
            <IconButton onClick={onStepPrev} disabled={sim.stepIndex === 0} aria-label="Paso anterior">
              ◂
            </IconButton>
            <IconButton active onClick={onTogglePlay} aria-label={sim.playing ? 'Pausar' : 'Reproducir'}>
              {sim.playing ? '❚❚' : '▶'}
            </IconButton>
            <IconButton onClick={onStepNext} disabled={atEnd} aria-label="Paso siguiente">
              ▸
            </IconButton>
          </div>
          <div className={styles.traceText}>
            Traza: <span className={styles.traceHighlight}>{traceText}</span>
          </div>
          <div className={`${styles.statusBox} ${statusTone === 'danger' ? styles.statusDanger : styles.statusAccent}`}>
            {statusLabel}
          </div>
        </>
      )}
    </div>
  );
}
