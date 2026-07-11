import styles from './TopBar.module.css';
import type { WorkspaceAutomaton } from '../hooks/useAutomataWorkspace';

interface TopBarProps {
  current: WorkspaceAutomaton | null;
  onGoHome: () => void;
  onToggleHelp: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ current, onGoHome, onToggleHelp, onToggleSidebar }: TopBarProps) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.hamburger} onClick={onToggleSidebar} aria-label="Abrir menú">
        ☰
      </button>
      <button type="button" className={styles.brand} onClick={onGoHome}>
        <span className={styles.logo}>A</span>
        <span className={styles.brandName}>ATOM</span>
      </button>
      <div className={styles.divider} />
      {current && (
        <div className={styles.breadcrumb}>
          <span className={styles.crumbLink} onClick={onGoHome}>
            Autómatas
          </span>
          <span>/</span>
          <span className={styles.crumbCurrent}>{current.name}</span>
        </div>
      )}
      <div className={styles.spacer} />
      <button type="button" className={styles.helpButton} onClick={onToggleHelp}>
        Ayuda de sintaxis
      </button>
    </div>
  );
}
