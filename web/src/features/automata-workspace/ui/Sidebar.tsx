import styles from './Sidebar.module.css';
import type { WorkspaceAutomaton } from '../hooks/useAutomataWorkspace';
import type { AutomatonExample } from '../services/examples';

interface SidebarProps {
  automatons: WorkspaceAutomaton[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  deleteConfirmId: string | null;
  onAskDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onNewAutomaton: () => void;
  quickExamples: AutomatonExample[];
  onLoadExample: (example: AutomatonExample) => void;
  isOpen: boolean;
  onBackdropClick: () => void;
}

function statusFor(a: WorkspaceAutomaton): { label: string; tone: string } {
  if (!a.compiled) return { label: 'Sin compilar', tone: 'muted' };
  if (a.stale) return { label: 'Modificado · recompilá', tone: 'warning' };
  if (a.compiled.ok) {
    return { label: `${a.compiled.automata.esDeterminista ? 'AFD' : 'AFND'} · ${a.compiled.automata.estados.length} estados`, tone: 'accent' };
  }
  return { label: '1 error', tone: 'danger' };
}

export function Sidebar({
  automatons,
  selectedId,
  onSelect,
  deleteConfirmId,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onNewAutomaton,
  quickExamples,
  onLoadExample,
  isOpen,
  onBackdropClick,
}: SidebarProps) {
  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onBackdropClick} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sectionTitle}>Autómatas guardados</div>

        {automatons.map((a) => {
          const status = statusFor(a);
          const selected = a.id === selectedId;
          return (
            <div key={a.id}>
              <div
                className={`${styles.railItem} ${selected ? styles.railItemSelected : ''}`}
                onClick={() => onSelect(a.id)}
              >
                <div className={styles.railRow}>
                  <span className={styles.railName}>{a.name}</span>
                  <span
                    className={styles.railDelete}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskDelete(a.id);
                    }}
                  >
                    ✕
                  </span>
                </div>
                <div className={`${styles.railStatus} ${styles[`tone-${status.tone}`]}`}>{status.label}</div>
              </div>
              {deleteConfirmId === a.id && (
                <div className={styles.deleteConfirm}>
                  <span>¿Eliminar &quot;{a.name}&quot;?</span>
                  <div className={styles.deleteActions}>
                    <span
                      className={styles.deleteConfirmBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmDelete(a.id);
                      }}
                    >
                      Eliminar
                    </span>
                    <span
                      className={styles.deleteCancelBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelDelete();
                      }}
                    >
                      Cancelar
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className={styles.newButton} onClick={onNewAutomaton}>
          + Nuevo autómata
        </div>

        <div className={styles.sectionTitle} style={{ marginTop: 20 }}>
          Ejemplos rápidos
        </div>
        {quickExamples.map((ex) => (
          <div key={ex.id} className={styles.exampleItem} onClick={() => onLoadExample(ex)}>
            ↓ {ex.name}
          </div>
        ))}

        <div className={styles.fill} />
      </aside>
    </>
  );
}
